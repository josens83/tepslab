import prisma from '../../config/prisma';
import {
  TepsExamAttempt,
  TepsExamConfig,
  TepsQuestion,
  ExamType,
  ExamDifficulty,
  ExamStatus,
  TepsSection,
  Prisma
} from '@prisma/client';
import { getPaginationParams, createPaginatedResult, PaginationParams } from '../../lib/db';

// Official TEPS Format
const OFFICIAL_TEPS_FORMAT = {
  totalTimeLimit: 135,
  sections: [
    { section: 'listening', questionCount: 60, timeLimit: 55 },
    { section: 'vocabulary', questionCount: 50, timeLimit: 20 },
    { section: 'grammar', questionCount: 50, timeLimit: 25 },
    { section: 'reading', questionCount: 40, timeLimit: 35 },
  ],
};

export interface UserAnswer {
  questionId: string;
  section: TepsSection;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  timeSpent: number;
  isCorrect?: boolean;
  markedForReview: boolean;
  answeredAt: Date;
}

export interface SectionResult {
  section: TepsSection;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  score: number;
}

export interface ExamResult {
  totalScore: number;
  percentile: number;
  estimatedLevel: string;
  sectionResults: SectionResult[];
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export class ExamService {
  /**
   * Create official TEPS simulation exam
   */
  static async createOfficialSimulation(
    userId: string,
    difficulty: ExamDifficulty = 'adaptive'
  ) {
    // Get or create official exam config
    let config = await prisma.tepsExamConfig.findFirst({
      where: {
        examType: 'official_simulation',
        difficulty,
        isOfficialFormat: true,
        isActive: true,
      },
    });

    if (!config) {
      config = await this.createOfficialExamConfig(difficulty);
    }

    // Select questions for this attempt
    const sections = await this.selectQuestionsForExam(config, userId);

    // Create exam attempt
    return prisma.tepsExamAttempt.create({
      data: {
        userId,
        examConfigId: config.id,
        examType: 'official_simulation',
        difficulty,
        status: 'not_started',
        deviceType: 'desktop',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }

  /**
   * Create official exam config
   */
  private static async createOfficialExamConfig(difficulty: ExamDifficulty) {
    return prisma.tepsExamConfig.create({
      data: {
        name: `Official TEPS Simulation - ${difficulty}`,
        description: 'Full official TEPS format simulation exam',
        examType: 'official_simulation',
        difficulty,
        totalTimeLimit: OFFICIAL_TEPS_FORMAT.totalTimeLimit,
        timePerSection: true,
        allowPause: false,
        sections: OFFICIAL_TEPS_FORMAT.sections,
        allowReview: true,
        shuffleQuestions: true,
        shuffleOptions: false,
        showTimer: true,
        autoSubmit: true,
        showScoreImmediately: true,
        showCorrectAnswers: true,
        showExplanations: true,
        isOfficialFormat: true,
        isActive: true,
      },
    });
  }

  /**
   * Select questions for an exam
   */
  private static async selectQuestionsForExam(
    config: TepsExamConfig,
    userId: string
  ) {
    const sections = config.sections as any[];
    const selectedQuestions: Record<string, string[]> = {};

    for (const sectionConfig of sections) {
      const questions = await prisma.tepsQuestion.findMany({
        where: {
          section: sectionConfig.section as TepsSection,
          reviewStatus: 'approved',
        },
        select: { id: true },
        take: sectionConfig.questionCount * 2, // Get more than needed
        orderBy: { createdAt: 'desc' },
      });

      // Randomly select required number
      const shuffled = questions.sort(() => Math.random() - 0.5);
      selectedQuestions[sectionConfig.section] = shuffled
        .slice(0, sectionConfig.questionCount)
        .map((q) => q.id);
    }

    return selectedQuestions;
  }

  /**
   * Get exam attempt by ID
   */
  static async getAttemptById(id: string) {
    return prisma.tepsExamAttempt.findUnique({
      where: { id },
      include: {
        examConfig: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Start exam
   */
  static async startExam(attemptId: string) {
    return prisma.tepsExamAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
        currentSection: 'listening',
        currentQuestionIndex: 0,
      },
    });
  }

  /**
   * Submit answer
   */
  static async submitAnswer(
    attemptId: string,
    questionId: string,
    selectedAnswer: 'A' | 'B' | 'C' | 'D',
    timeSpent: number
  ) {
    const attempt = await prisma.tepsExamAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.status !== 'in_progress') {
      throw new Error('Invalid exam attempt');
    }

    // Get question to check answer
    const question = await prisma.tepsQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Update answers array
    const answers = (attempt.answers as UserAnswer[]) || [];
    const existingIndex = answers.findIndex((a) => a.questionId === questionId);

    const userAnswer: UserAnswer = {
      questionId,
      section: question.section,
      selectedAnswer,
      timeSpent,
      isCorrect,
      markedForReview: false,
      answeredAt: new Date(),
    };

    if (existingIndex >= 0) {
      answers[existingIndex] = userAnswer;
    } else {
      answers.push(userAnswer);
    }

    return prisma.tepsExamAttempt.update({
      where: { id: attemptId },
      data: {
        answers,
        currentQuestionIndex: { increment: 1 },
      },
    });
  }

  /**
   * Complete exam and calculate results
   */
  static async completeExam(attemptId: string) {
    const attempt = await prisma.tepsExamAttempt.findUnique({
      where: { id: attemptId },
      include: { examConfig: true },
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const result = await this.calculateResult(attempt);

    return prisma.tepsExamAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        result,
      },
    });
  }

  /**
   * Calculate exam result
   */
  private static async calculateResult(
    attempt: TepsExamAttempt & { examConfig: TepsExamConfig }
  ): Promise<ExamResult> {
    const answers = (attempt.answers as UserAnswer[]) || [];
    const sections = (attempt.examConfig.sections as any[]) || [];

    const sectionResults: SectionResult[] = [];

    for (const sectionConfig of sections) {
      const sectionAnswers = answers.filter((a) => a.section === sectionConfig.section);
      const correctAnswers = sectionAnswers.filter((a) => a.isCorrect).length;
      const totalQuestions = sectionConfig.questionCount;
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const timeSpent = sectionAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
      const score = Math.round((correctAnswers / totalQuestions) * 150);

      sectionResults.push({
        section: sectionConfig.section,
        correctAnswers,
        totalQuestions,
        accuracy,
        timeSpent,
        score,
      });
    }

    const totalScore = sectionResults.reduce((sum, sr) => sum + sr.score, 0);
    const totalTimeSpent = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTimePerQuestion = answers.length > 0 ? totalTimeSpent / answers.length : 0;

    // Estimate level
    let estimatedLevel = '';
    if (totalScore < 200) estimatedLevel = 'A1-A2 (Elementary)';
    else if (totalScore < 300) estimatedLevel = 'A2-B1 (Pre-Intermediate)';
    else if (totalScore < 400) estimatedLevel = 'B1-B2 (Intermediate)';
    else if (totalScore < 500) estimatedLevel = 'B2-C1 (Upper Intermediate)';
    else estimatedLevel = 'C1-C2 (Advanced)';

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    sectionResults.forEach((sr) => {
      if (sr.accuracy >= 80) {
        strengths.push(`Strong in ${sr.section} (${sr.accuracy.toFixed(1)}%)`);
      } else if (sr.accuracy < 60) {
        weaknesses.push(`Needs improvement in ${sr.section} (${sr.accuracy.toFixed(1)}%)`);
      }
    });

    const recommendations = [
      'Review explanations for incorrect answers',
      'Take regular practice tests',
    ];
    if (weaknesses.length > 0) {
      recommendations.unshift('Focus on weak areas with targeted practice');
    }

    return {
      totalScore,
      percentile: 50, // TODO: Calculate from all test takers
      estimatedLevel,
      sectionResults,
      totalTimeSpent,
      averageTimePerQuestion,
      strengths,
      weaknesses,
      recommendations,
    };
  }

  /**
   * Get user's exam history
   */
  static async getUserExamHistory(
    userId: string,
    params: PaginationParams & { examType?: ExamType; status?: ExamStatus }
  ) {
    const { page, limit, skip } = getPaginationParams(params);

    const where: Prisma.TepsExamAttemptWhereInput = { userId };

    if (params.examType) {
      where.examType = params.examType;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [attempts, total] = await Promise.all([
      prisma.tepsExamAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          examConfig: {
            select: { name: true, examType: true, difficulty: true },
          },
        },
      }),
      prisma.tepsExamAttempt.count({ where }),
    ]);

    return createPaginatedResult(attempts, total, page, limit);
  }

  /**
   * Get user's best score
   */
  static async getUserBestScore(userId: string) {
    const attempts = await prisma.tepsExamAttempt.findMany({
      where: {
        userId,
        status: 'completed',
        result: { not: Prisma.JsonNull },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (attempts.length === 0) {
      return null;
    }

    let bestScore = 0;
    let bestAttempt = null;

    for (const attempt of attempts) {
      const result = attempt.result as ExamResult | null;
      if (result && result.totalScore > bestScore) {
        bestScore = result.totalScore;
        bestAttempt = attempt;
      }
    }

    return bestAttempt;
  }
}

export default ExamService;
