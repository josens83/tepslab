import {
  TEPSExamConfig,
  ITEPSExamConfig,
} from '../models/TEPSExamConfig';
import {
  TEPSExamAttempt,
  ITEPSExamAttempt,
  ExamType,
  ExamDifficulty,
  ExamStatus,
  SectionConfig,
} from '../models/TEPSExam';
import { TEPSQuestion, TEPSSection, DifficultyLevel } from '../models/TEPSQuestion';
import { TEPSQuestionBankService } from './tepsQuestionBankService';
import { UserLearningProfile } from '../models/UserLearningProfile';
import mongoose from 'mongoose';

/**
 * Exam Creation Request
 */
export interface CreateExamRequest {
  userId: string;
  examType: ExamType;
  difficulty?: ExamDifficulty;
  sections?: TEPSSection[]; // For section practice
  duration?: number; // For micro-learning (in minutes)
  useTemplate?: string; // Exam config ID
}

/**
 * Official TEPS Exam Format
 * 4 sections, 135 minutes total, 200 questions
 */
const OFFICIAL_TEPS_FORMAT = {
  totalTimeLimit: 135,
  sections: [
    { section: TEPSSection.LISTENING, questionCount: 60, timeLimit: 55 },
    { section: TEPSSection.VOCABULARY, questionCount: 50, timeLimit: 20 },
    { section: TEPSSection.GRAMMAR, questionCount: 50, timeLimit: 25 },
    { section: TEPSSection.READING, questionCount: 40, timeLimit: 35 },
  ],
};

/**
 * TEPS Exam Service
 * Handles CBT exam creation, management, and scoring
 */
export class TEPSExamService {
  /**
   * Create official TEPS simulation exam
   */
  static async createOfficialSimulation(
    userId: string,
    difficulty: ExamDifficulty = ExamDifficulty.ADAPTIVE
  ): Promise<ITEPSExamAttempt> {
    // Get or create official exam config
    let config = await TEPSExamConfig.findOne({
      examType: ExamType.OFFICIAL_SIMULATION,
      difficulty,
      isOfficialFormat: true,
      isActive: true,
    });

    if (!config) {
      config = await this.createOfficialExamConfig(userId, difficulty) as any;
    }

    // Select questions for this attempt
    await this.selectQuestionsForConfig(config, userId);

    // Create exam attempt
    const attempt = await TEPSExamAttempt.create({
      userId: new mongoose.Types.ObjectId(userId),
      examConfigId: config._id,
      examType: ExamType.OFFICIAL_SIMULATION,
      difficulty,
      status: ExamStatus.NOT_STARTED,
      deviceType: 'desktop',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours to complete
    });

    return attempt;
  }

  /**
   * Create official exam config template
   */
  private static async createOfficialExamConfig(
    userId: string,
    difficulty: ExamDifficulty
  ): Promise<ITEPSExamConfig> {
    const sections: SectionConfig[] = [];

    for (const sectionTemplate of OFFICIAL_TEPS_FORMAT.sections) {
      sections.push({
        section: sectionTemplate.section,
        questionCount: sectionTemplate.questionCount,
        timeLimit: sectionTemplate.timeLimit,
        questions: [], // Will be filled when creating attempt
      });
    }

    const config = await TEPSExamConfig.create({
      name: `Official TEPS Simulation - ${difficulty}`,
      description: 'Full official TEPS exam simulation with 200 questions in 135 minutes',
      examType: ExamType.OFFICIAL_SIMULATION,
      difficulty,
      totalTimeLimit: OFFICIAL_TEPS_FORMAT.totalTimeLimit,
      timePerSection: false, // All sections use shared time
      allowPause: false, // No pause in official exam
      sections,
      allowReview: true,
      shuffleQuestions: false, // Keep official order
      shuffleOptions: true, // Shuffle answer options
      showTimer: true,
      autoSubmit: true,
      showScoreImmediately: true,
      showCorrectAnswers: true,
      showExplanations: true,
      isOfficialFormat: true,
      isActive: true,
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return config;
  }

  /**
   * Select questions for exam config based on user level
   */
  private static async selectQuestionsForConfig(
    config: ITEPSExamConfig,
    userId: string
  ): Promise<void> {
    // Get user profile to determine ability level
    const profile = await UserLearningProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    for (const section of config.sections) {
      const targetDifficulty = this.getDifficultyForSection(
        config.difficulty,
        section.section,
        profile
      );

      // Search for questions in this section with target difficulty
      const { questions } = await TEPSQuestionBankService.searchQuestions(
        {
          section: section.section,
          difficultyLevel: targetDifficulty,
          reviewStatus: 'approved',
          minQualityScore: 70,
        },
        section.questionCount * 2 // Get more than needed for randomization
      );

      // Randomly select required number of questions
      const selectedQuestions = this.shuffleArray(questions).slice(
        0,
        section.questionCount
      );

      section.questions = selectedQuestions.map((q) => q._id);
    }

    await config.save();
  }

  /**
   * Get difficulty levels for section based on exam difficulty and user profile
   */
  private static getDifficultyForSection(
    examDifficulty: ExamDifficulty,
    section: TEPSSection,
    profile: any
  ): DifficultyLevel[] {
    if (examDifficulty === ExamDifficulty.ADAPTIVE && profile) {
      // Adaptive: use user's ability for this section
      const ability = profile.abilityEstimates[section] || 0;
      if (ability <= -1.5) return [DifficultyLevel.VERY_EASY, DifficultyLevel.EASY];
      if (ability <= -0.5) return [DifficultyLevel.EASY, DifficultyLevel.MEDIUM];
      if (ability <= 0.5) return [DifficultyLevel.MEDIUM];
      if (ability <= 1.5) return [DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
      return [DifficultyLevel.HARD, DifficultyLevel.VERY_HARD];
    }

    // Fixed difficulty levels
    const difficultyMap: Record<ExamDifficulty, DifficultyLevel[]> = {
      [ExamDifficulty.BEGINNER]: [DifficultyLevel.VERY_EASY, DifficultyLevel.EASY],
      [ExamDifficulty.INTERMEDIATE]: [DifficultyLevel.EASY, DifficultyLevel.MEDIUM],
      [ExamDifficulty.ADVANCED]: [DifficultyLevel.MEDIUM, DifficultyLevel.HARD],
      [ExamDifficulty.EXPERT]: [DifficultyLevel.HARD, DifficultyLevel.VERY_HARD],
      [ExamDifficulty.ADAPTIVE]: [DifficultyLevel.MEDIUM], // Fallback
    };

    return difficultyMap[examDifficulty];
  }

  /**
   * Create micro-learning session (5/10/15 minutes)
   */
  static async createMicroLearningSession(
    userId: string,
    duration: number, // 5, 10, or 15 minutes
    section?: TEPSSection
  ): Promise<ITEPSExamAttempt> {
    // Calculate question count based on duration
    // Assume 1 minute per question
    const questionCount = duration;

    // If no section specified, select user's weakest section
    let targetSection = section;
    if (!targetSection) {
      const profile = await UserLearningProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (profile && profile.weakTopics.length > 0) {
        targetSection = profile.weakTopics[0].section;
      } else {
        // Default to listening
        targetSection = TEPSSection.LISTENING;
      }
    }

    // Create config
    const config = await TEPSExamConfig.create({
      name: `${duration}-Minute ${targetSection} Practice`,
      description: `Quick ${duration}-minute practice session for ${targetSection}`,
      examType: ExamType.MICRO_LEARNING,
      difficulty: ExamDifficulty.ADAPTIVE,
      totalTimeLimit: duration,
      timePerSection: false,
      allowPause: true,
      maxPauseDuration: 5,
      sections: [
        {
          section: targetSection,
          questionCount,
          timeLimit: duration,
          questions: [],
        },
      ],
      allowReview: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showTimer: true,
      autoSubmit: true,
      showScoreImmediately: true,
      showCorrectAnswers: true,
      showExplanations: true,
      isOfficialFormat: false,
      isActive: true,
      isPublic: false,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // Select questions
    await this.selectQuestionsForConfig(config, userId);

    // Create attempt
    const attempt = await TEPSExamAttempt.create({
      userId: new mongoose.Types.ObjectId(userId),
      examConfigId: config._id,
      examType: ExamType.MICRO_LEARNING,
      difficulty: ExamDifficulty.ADAPTIVE,
      status: ExamStatus.NOT_STARTED,
      deviceType: 'desktop',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour to complete
    });

    return attempt;
  }

  /**
   * Create section practice exam
   */
  static async createSectionPractice(
    userId: string,
    section: TEPSSection,
    questionCount: number = 30,
    difficulty: ExamDifficulty = ExamDifficulty.ADAPTIVE
  ): Promise<ITEPSExamAttempt> {
    const timeLimit = questionCount; // 1 minute per question

    const config = await TEPSExamConfig.create({
      name: `${section} Practice - ${questionCount} Questions`,
      description: `Focused practice on ${section} section`,
      examType: ExamType.SECTION_PRACTICE,
      difficulty,
      totalTimeLimit: timeLimit,
      timePerSection: false,
      allowPause: true,
      sections: [
        {
          section,
          questionCount,
          timeLimit,
          questions: [],
        },
      ],
      allowReview: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showTimer: true,
      autoSubmit: false,
      showScoreImmediately: true,
      showCorrectAnswers: true,
      showExplanations: true,
      isOfficialFormat: false,
      isActive: true,
      isPublic: false,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await this.selectQuestionsForConfig(config, userId);

    const attempt = await TEPSExamAttempt.create({
      userId: new mongoose.Types.ObjectId(userId),
      examConfigId: config._id,
      examType: ExamType.SECTION_PRACTICE,
      difficulty,
      status: ExamStatus.NOT_STARTED,
      deviceType: 'desktop',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return attempt;
  }

  /**
   * Start exam attempt
   */
  static async startExam(attemptId: string): Promise<ITEPSExamAttempt> {
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new Error('Exam attempt not found');
    }

    if (attempt.status !== ExamStatus.NOT_STARTED && attempt.status !== ExamStatus.PAUSED) {
      throw new Error('Exam already started or completed');
    }

    attempt.status = ExamStatus.IN_PROGRESS;
    attempt.startedAt = new Date();

    await attempt.save();

    return attempt;
  }

  /**
   * Get exam questions with attempt details
   */
  static async getExamQuestions(attemptId: string): Promise<{
    attempt: ITEPSExamAttempt;
    config: ITEPSExamConfig;
    questions: any[];
  }> {
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new Error('Exam attempt not found');
    }

    const config = await TEPSExamConfig.findById(attempt.examConfigId);

    if (!config) {
      throw new Error('Exam config not found');
    }

    // Get all questions for all sections
    const questions: any[] = [];

    for (const section of config.sections) {
      const sectionQuestions = await TEPSQuestion.find({
        _id: { $in: section.questions },
      })
        .select(
          '_id questionType section difficultyLevel questionText options audioResource readingPassage imageUrl topic tags'
        )
        .lean();

      questions.push(...sectionQuestions);
    }

    // Shuffle questions if required
    const finalQuestions = config.shuffleQuestions
      ? this.shuffleArray(questions)
      : questions;

    // Shuffle options if required
    if (config.shuffleOptions) {
      finalQuestions.forEach((q: any) => {
        q.options = this.shuffleOptions(q.options);
      });
    }

    return {
      attempt,
      config,
      questions: finalQuestions,
    };
  }

  /**
   * Submit answer
   */
  static async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: string,
    timeSpent: number
  ): Promise<void> {
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new Error('Exam attempt not found');
    }

    if (attempt.status !== ExamStatus.IN_PROGRESS) {
      throw new Error('Exam is not in progress');
    }

    await attempt.submitAnswer(questionId, answer, timeSpent);
  }

  /**
   * Complete exam
   */
  static async completeExam(attemptId: string): Promise<ITEPSExamAttempt> {
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new Error('Exam attempt not found');
    }

    await attempt.completeExam();

    // Update config statistics
    const config = await TEPSExamConfig.findById(attempt.examConfigId);
    if (config && attempt.result) {
      config.usageCount += 1;
      config.averageScore =
        (config.averageScore * (config.usageCount - 1) + attempt.result.totalScore) /
        config.usageCount;
      config.averageCompletionTime =
        (config.averageCompletionTime * (config.usageCount - 1) +
          attempt.result.totalTimeSpent) /
        config.usageCount;
      await config.save();
    }

    return attempt;
  }

  /**
   * Get user exam history
   */
  static async getUserExamHistory(
    userId: string,
    examType?: ExamType,
    limit: number = 20,
    skip: number = 0
  ): Promise<{ attempts: ITEPSExamAttempt[]; total: number }> {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      status: ExamStatus.COMPLETED,
    };

    if (examType) {
      query.examType = examType;
    }

    const [attempts, total] = await Promise.all([
      TEPSExamAttempt.find(query)
        .sort({ completedAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('examConfigId')
        .exec(),
      TEPSExamAttempt.countDocuments(query),
    ]);

    return { attempts, total };
  }

  /**
   * Get exam statistics
   */
  static async getExamStatistics(userId: string): Promise<{
    totalExamsTaken: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    recentProgress: { date: string; score: number }[];
    sectionAverages: { section: string; average: number }[];
  }> {
    const attempts = await TEPSExamAttempt.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: ExamStatus.COMPLETED,
    }).sort({ completedAt: -1 });

    const totalExamsTaken = attempts.length;

    if (totalExamsTaken === 0) {
      return {
        totalExamsTaken: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        recentProgress: [],
        sectionAverages: [],
      };
    }

    const scores = attempts.map((a) => a.result?.totalScore || 0);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Recent progress (last 10 exams)
    const recentProgress = attempts.slice(0, 10).map((a) => ({
      date: a.completedAt?.toISOString().split('T')[0] || '',
      score: a.result?.totalScore || 0,
    }));

    // Section averages
    const sectionScores: Record<string, number[]> = {};
    attempts.forEach((a) => {
      a.result?.sectionResults.forEach((sr) => {
        if (!sectionScores[sr.section]) {
          sectionScores[sr.section] = [];
        }
        sectionScores[sr.section].push(sr.score);
      });
    });

    const sectionAverages = Object.entries(sectionScores).map(([section, scores]) => ({
      section,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));

    return {
      totalExamsTaken,
      averageScore,
      highestScore,
      lowestScore,
      recentProgress,
      sectionAverages,
    };
  }

  /**
   * Helper: Shuffle array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Helper: Shuffle answer options while maintaining correct answer
   */
  private static shuffleOptions(options: { A: string; B: string; C: string; D: string }): {
    A: string;
    B: string;
    C: string;
    D: string;
  } {
    const entries = Object.entries(options);
    const shuffled = this.shuffleArray(entries);
    return {
      A: shuffled[0][1],
      B: shuffled[1][1],
      C: shuffled[2][1],
      D: shuffled[3][1],
    };
  }
}
