import { getOpenAIClient } from '../config/openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import {
  AITutorSession,
  IAITutorSession,
  MessageRole,
  SessionType,
} from '../models/AITutorSession';
import {
  LearningCoachSession,
  ILearningCoachSession,
  CoachingType,
  CoachingInsight,
  MotivationBoost,
} from '../models/LearningCoachSession';
import { UserLearningProfile } from '../models/UserLearningProfile';
import { TEPSExamAttempt } from '../models/TEPSExam';
import { TEPSQuestion } from '../models/TEPSQuestion';
import mongoose from 'mongoose';

/**
 * Enhanced AI Tutor Response
 */
export interface EnhancedTutorResponse {
  message: string;
  suggestions: string[];
  relatedTopics: string[];
  sentimentScore: number; // -1 to 1
  recommendedActions: {
    type: 'practice' | 'review' | 'rest' | 'seek_help';
    description: string;
  }[];
  motivationalBoost?: string;
}

/**
 * Coaching Report
 */
export interface CoachingReport {
  period: string;
  summary: string;
  insights: CoachingInsight[];
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  actionPlan: string[];
  motivationScore: number; // 0-100
  nextSteps: string[];
}

/**
 * Enhanced AI Tutor Service
 * 24/7 AI Learning Assistant with advanced coaching capabilities
 */
export class EnhancedAITutorService {
  /**
   * Start a new tutor session
   */
  static async startSession(
    userId: string,
    sessionType: SessionType = SessionType.GENERAL_QA
  ): Promise<IAITutorSession> {
    // End any active sessions
    await AITutorSession.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isActive: true },
      { isActive: false, endedAt: new Date() }
    );

    // Get user context
    const profile = await UserLearningProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    const context: any = {};

    if (profile) {
      context.weakAreas = profile.weakTopics.slice(0, 3).map((wt) => wt.topic);
      context.strongAreas = profile.strongTopics.slice(0, 3).map((st) => st.topic);

      // Infer mood from recent performance
      const recentPerformance = profile.performanceHistory.slice(-10);
      if (recentPerformance.length > 0) {
        const recentAccuracy =
          recentPerformance.filter((p) => p.isCorrect).length / recentPerformance.length;

        if (recentAccuracy < 0.4) context.mood = 'frustrated';
        else if (recentAccuracy > 0.7) context.mood = 'motivated';
        else context.mood = 'neutral';
      }
    }

    // Create new session
    const session = await AITutorSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      sessionType,
      context,
      isActive: true,
    });

    // Add welcome message
    const welcomeMessage = await this.generateWelcomeMessage(sessionType, context);
    await session.addMessage(MessageRole.SYSTEM, welcomeMessage);

    return session;
  }

  /**
   * Generate welcome message based on session type and user context
   */
  private static async generateWelcomeMessage(
    sessionType: SessionType,
    context: any
  ): Promise<string> {
    const welcomeMessages: Record<SessionType, string> = {
      [SessionType.GENERAL_QA]:
        '안녕하세요! TEPS 학습을 도와드릴 AI 튜터입니다. 무엇을 도와드릴까요?',
      [SessionType.PROBLEM_EXPLANATION]:
        '문제 해설을 도와드리겠습니다. 어떤 문제가 궁금하신가요?',
      [SessionType.STUDY_COACHING]:
        '학습 전략에 대해 상담해드리겠습니다. 현재 고민하시는 부분을 말씀해주세요.',
      [SessionType.MOTIVATION]:
        '힘든 순간이신가요? 함께 이겨내봅시다! 어떤 점이 가장 어려우신가요?',
      [SessionType.GOAL_SETTING]:
        '목표를 함께 설정해봅시다. 원하시는 TEPS 점수와 목표 달성 시기를 알려주세요.',
      [SessionType.PROGRESS_REVIEW]:
        '지금까지의 학습 진도를 리뷰해드리겠습니다. 궁금하신 점이 있으신가요?',
    };

    let message = welcomeMessages[sessionType];

    // Add context-aware greeting
    if (context.mood === 'frustrated') {
      message +=
        ' 최근 어려움을 겪고 계신 것 같네요. 천천히 함께 해결해나가봅시다.';
    } else if (context.mood === 'motivated') {
      message += ' 최근 좋은 성과를 보이고 계시네요! 계속 힘내세요!';
    }

    if (context.weakAreas && context.weakAreas.length > 0) {
      message += `\n참고로, ${context.weakAreas.join(', ')} 영역에서 더 집중하시면 좋을 것 같습니다.`;
    }

    return message;
  }

  /**
   * Chat with AI tutor (context-aware conversation)
   */
  static async chat(
    sessionId: string,
    userMessage: string
  ): Promise<EnhancedTutorResponse> {
    const session = await AITutorSession.findById(sessionId);

    if (!session || !session.isActive) {
      throw new Error('Invalid or inactive session');
    }

    const openai = getOpenAIClient();

    if (!openai) {
      throw new Error('OpenAI is not configured');
    }

    // Build conversation history
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.getSystemPrompt(session.sessionType, session.context),
      },
    ];

    // Add conversation history (last 10 messages for context)
    const recentMessages = session.messages.slice(-10);
    recentMessages.forEach((msg) => {
      if (msg.role !== MessageRole.SYSTEM) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    });

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    try {
      // Get AI response
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      });

      const assistantMessage =
        response.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';

      // Analyze sentiment
      const sentimentScore = await this.analyzeSentiment(userMessage);

      // Save messages to session
      await session.addMessage(MessageRole.USER, userMessage, { sentimentScore });
      await session.addMessage(MessageRole.ASSISTANT, assistantMessage);

      // Extract suggestions and topics
      const suggestions = this.extractSuggestions(assistantMessage);
      const relatedTopics = this.extractRelatedTopics(assistantMessage);
      const recommendedActions = this.generateRecommendedActions(
        session.context,
        sentimentScore
      );

      // Add motivational boost if user is struggling
      let motivationalBoost: string | undefined;
      if (sentimentScore < -0.3 || session.context?.mood === 'frustrated') {
        motivationalBoost = await this.generateMotivationalBoost(
          session.userId.toString()
        );
      }

      return {
        message: assistantMessage,
        suggestions,
        relatedTopics,
        sentimentScore,
        recommendedActions,
        motivationalBoost,
      };
    } catch (error) {
      console.error('Enhanced AI Tutor chat error:', error);
      throw new Error('Failed to get AI tutor response');
    }
  }

  /**
   * Get system prompt based on session type
   */
  private static getSystemPrompt(sessionType: SessionType, context: any): string {
    const basePrompt = `You are an expert TEPS tutor and learning coach with deep expertise in:
- TEPS test format, structure, and scoring
- Grammar, vocabulary, listening, and reading strategies
- Personalized learning path optimization
- Student motivation and habit formation
- Korean education system and study culture

Your communication style:
- Empathetic and encouraging
- Clear and actionable advice
- Adapt to student's emotional state
- Provide specific examples
- Use positive reinforcement

Always respond in Korean unless specifically asked otherwise.`;

    const typeSpecificPrompts: Record<SessionType, string> = {
      [SessionType.GENERAL_QA]: `\n\nFocus on:
- Answering questions clearly and accurately
- Providing practical examples
- Suggesting next steps`,

      [SessionType.PROBLEM_EXPLANATION]: `\n\nFocus on:
- Breaking down complex problems step-by-step
- Explaining underlying concepts
- Highlighting common mistakes
- Providing similar practice problems`,

      [SessionType.STUDY_COACHING]: `\n\nFocus on:
- Analyzing current study methods
- Suggesting evidence-based strategies
- Creating realistic study schedules
- Balancing different TEPS sections`,

      [SessionType.MOTIVATION]: `\n\nFocus on:
- Acknowledging struggles empathetically
- Celebrating small wins
- Reframing challenges as opportunities
- Sharing success stories
- Building confidence`,

      [SessionType.GOAL_SETTING]: `\n\nFocus on:
- Setting SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Breaking down long-term goals into milestones
- Creating accountability systems
- Tracking progress metrics`,

      [SessionType.PROGRESS_REVIEW]: `\n\nFocus on:
- Highlighting achievements and growth
- Identifying patterns in performance
- Suggesting areas for improvement
- Adjusting study plans based on data`,
    };

    let prompt = basePrompt + typeSpecificPrompts[sessionType];

    // Add context-specific instructions
    if (context?.mood === 'frustrated') {
      prompt += `\n\nStudent is currently feeling frustrated. Be extra encouraging and patient.`;
    } else if (context?.mood === 'motivated') {
      prompt += `\n\nStudent is motivated! Leverage this energy with challenging suggestions.`;
    }

    if (context?.weakAreas && context.weakAreas.length > 0) {
      prompt += `\n\nStudent's weak areas: ${context.weakAreas.join(', ')}. Tactfully address these.`;
    }

    return prompt;
  }

  /**
   * Analyze sentiment of user message
   */
  private static async analyzeSentiment(message: string): Promise<number> {
    // Simple keyword-based sentiment analysis
    // In production, use a proper sentiment analysis API

    const positiveKeywords = [
      '좋아요',
      '감사',
      '도움',
      '이해',
      '알겠',
      '재미',
      '흥미',
      '열심히',
      '파이팅',
      '할 수 있',
    ];
    const negativeKeywords = [
      '어려워',
      '힘들',
      '포기',
      '못하겠',
      '모르겠',
      '답답',
      '짜증',
      '지겨워',
      '불가능',
      '안돼',
    ];

    let score = 0;

    positiveKeywords.forEach((keyword) => {
      if (message.includes(keyword)) score += 0.1;
    });

    negativeKeywords.forEach((keyword) => {
      if (message.includes(keyword)) score -= 0.1;
    });

    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Extract suggestions from AI response
   */
  private static extractSuggestions(message: string): string[] {
    const suggestions: string[] = [];

    // Look for numbered lists or bullet points
    const lines = message.split('\n');
    lines.forEach((line) => {
      if (/^[\d\-\*]\s/.test(line.trim())) {
        suggestions.push(line.trim().replace(/^[\d\-\*]\s/, ''));
      }
    });

    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  /**
   * Extract related topics
   */
  private static extractRelatedTopics(message: string): string[] {
    const topics = new Set<string>();

    // Common TEPS topics
    const tepsTopics = [
      '문법',
      '어휘',
      '독해',
      '청해',
      '시제',
      '관계대명사',
      '가정법',
      '수동태',
      '부정사',
      '동명사',
      '분사',
      '접속사',
    ];

    tepsTopics.forEach((topic) => {
      if (message.includes(topic)) {
        topics.add(topic);
      }
    });

    return Array.from(topics).slice(0, 5);
  }

  /**
   * Generate recommended actions based on context
   */
  private static generateRecommendedActions(
    context: any,
    sentimentScore: number
  ): { type: 'practice' | 'review' | 'rest' | 'seek_help'; description: string }[] {
    const actions: { type: 'practice' | 'review' | 'rest' | 'seek_help'; description: string }[] = [];

    if (sentimentScore < -0.3) {
      actions.push({
        type: 'rest',
        description: '잠시 휴식을 취하고 마음을 재정비하세요.',
      });
      actions.push({
        type: 'seek_help',
        description: '튜터 세션을 예약하거나 스터디 그룹에 참여해보세요.',
      });
    }

    if (context?.weakAreas && context.weakAreas.length > 0) {
      actions.push({
        type: 'practice',
        description: `${context.weakAreas[0]} 영역 집중 연습을 시작하세요.`,
      });
    }

    if (context?.mood === 'motivated') {
      actions.push({
        type: 'practice',
        description: '지금 컨디션이 좋습니다! 어려운 문제에 도전해보세요.',
      });
    }

    return actions;
  }

  /**
   * Generate motivational boost
   */
  private static async generateMotivationalBoost(userId: string): Promise<string> {
    const motivationalMessages = [
      '어려운 시기를 지나고 있지만, 이 모든 노력이 반드시 결실을 맺을 것입니다!',
      '완벽하지 않아도 괜찮습니다. 꾸준히 하는 것이 가장 중요합니다.',
      '오늘의 작은 진전이 내일의 큰 성공을 만듭니다.',
      '힘들 때일수록 기본으로 돌아가세요. 천천히, 확실하게.',
      '당신의 목표는 충분히 달성 가능합니다. 지금까지 잘 해오셨습니다!',
    ];

    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  }

  /**
   * End session
   */
  static async endSession(sessionId: string, userFeedback?: {
    satisfaction: number;
    helpfulness: number;
  }): Promise<void> {
    const session = await AITutorSession.findById(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (userFeedback) {
      session.metrics.userSatisfaction = userFeedback.satisfaction;
      session.metrics.helpfulness = userFeedback.helpfulness;
    }

    await session.endSession();
  }

  /**
   * Generate weekly coaching report
   */
  static async generateWeeklyReport(userId: string): Promise<CoachingReport> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get user profile
    const profile = await UserLearningProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Get recent exam attempts
    const recentExams = await TEPSExamAttempt.find({
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: oneWeekAgo },
    }).sort({ completedAt: -1 });

    // Get recent tutor sessions
    const recentSessions = await AITutorSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      startedAt: { $gte: oneWeekAgo },
    });

    // Calculate metrics
    const studyDays = new Set(
      [...recentExams.map((e) => e.completedAt?.toISOString().split('T')[0])].filter(
        Boolean
      )
    ).size;

    const questionsAttempted = profile?.performanceHistory.filter(
      (p) => p.timestamp >= oneWeekAgo
    ).length || 0;

    const recentPerformance =
      profile?.performanceHistory.filter((p) => p.timestamp >= oneWeekAgo) || [];
    const accuracy =
      recentPerformance.length > 0
        ? (recentPerformance.filter((p) => p.isCorrect).length /
            recentPerformance.length) *
          100
        : 0;

    // Generate insights
    const insights: CoachingInsight[] = [];

    if (studyDays >= 5) {
      insights.push({
        category: 'strength',
        title: '우수한 학습 일관성',
        description: `이번 주 ${studyDays}일 동안 학습하셨습니다. 꾸준함이 돋보입니다!`,
        evidence: [`${studyDays}일 학습`],
        actionable: false,
      });
    }

    if (accuracy >= 75) {
      insights.push({
        category: 'strength',
        title: '높은 정답률',
        description: `${accuracy.toFixed(1)}%의 정답률을 기록하셨습니다.`,
        evidence: [`정답률 ${accuracy.toFixed(1)}%`],
        actionable: false,
      });
    } else if (accuracy < 60) {
      insights.push({
        category: 'weakness',
        title: '정답률 개선 필요',
        description: '기본 개념 복습과 오답 분석이 필요합니다.',
        evidence: [`정답률 ${accuracy.toFixed(1)}%`],
        actionable: true,
      });
    }

    if (profile && profile.weakTopics.length > 0) {
      insights.push({
        category: 'opportunity',
        title: '취약 영역 집중 공략',
        description: `${profile.weakTopics[0].topic} 영역에 더 많은 시간을 투자하세요.`,
        evidence: [`${profile.weakTopics[0].topic} 오답률 ${(profile.weakTopics[0].errorRate * 100).toFixed(1)}%`],
        actionable: true,
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (studyDays < 5) {
      recommendations.push('주 5일 이상 학습하는 것을 목표로 하세요.');
    }

    if (questionsAttempted < 100) {
      recommendations.push('주당 최소 100문제 이상 풀이를 권장합니다.');
    }

    if (accuracy < 70) {
      recommendations.push('정답률 향상을 위해 오답 노트를 작성하고 복습하세요.');
    }

    recommendations.push('매일 일정한 시간에 학습하는 습관을 만드세요.');

    return {
      period: 'last_week',
      summary: `이번 주 ${studyDays}일 학습, ${questionsAttempted}문제 풀이, ${accuracy.toFixed(1)}% 정답률을 기록하셨습니다.`,
      insights,
      achievements: studyDays >= 5 ? ['주 5일 이상 학습 달성'] : [],
      challenges:
        accuracy < 60 ? ['정답률이 목표치(70%)보다 낮습니다.'] : [],
      recommendations,
      actionPlan: [
        '매일 30분 이상 학습 시간 확보',
        '취약 영역 집중 학습',
        '오답 노트 작성 및 복습',
      ],
      motivationScore: Math.min(100, studyDays * 15 + (accuracy / 100) * 30),
      nextSteps: [
        '다음 주 학습 목표 설정',
        '모의고사 일정 계획',
        '스터디 그룹 참여 고려',
      ],
    };
  }

  /**
   * Create coaching session
   */
  static async createCoachingSession(
    userId: string,
    coachingType: CoachingType
  ): Promise<ILearningCoachSession> {
    let performanceSummary: any;
    let insights: CoachingInsight[] = [];
    let recommendations: string[] = [];

    if (coachingType === CoachingType.WEEKLY_CHECKIN) {
      const report = await this.generateWeeklyReport(userId);
      performanceSummary = {
        period: 'last_week',
        studyDays: parseInt(report.summary.match(/(\d+)일 학습/)?.[1] || '0'),
        totalStudyTime: 0, // TODO: Calculate from activity logs
        questionsAttempted: parseInt(
          report.summary.match(/(\d+)문제 풀이/)?.[1] || '0'
        ),
        accuracy: parseFloat(
          report.summary.match(/([\d.]+)% 정답률/)?.[1] || '0'
        ),
        scoreChange: 0,
        topImprovement: report.achievements[0] || '',
        needsAttention: report.challenges[0] || '',
      };
      insights = report.insights;
      recommendations = report.recommendations;
    }

    const session = await LearningCoachSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      coachingType,
      insights,
      recommendations,
      performanceSummary,
      nextSessionAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    });

    return session;
  }

  /**
   * Add learning habit
   */
  static async addLearningHabit(
    userId: string,
    habitName: string,
    description: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    targetDays: string[],
    targetTime?: string
  ): Promise<void> {
    const session = await LearningCoachSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    if (!session) {
      // Create a new coaching session
      const newSession = await LearningCoachSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        coachingType: CoachingType.HABIT_BUILDING,
      });

      newSession.habits.push({
        habitName,
        description,
        frequency,
        targetDays,
        targetTime,
        reminderEnabled: true,
        streakCount: 0,
        createdAt: new Date(),
      });

      await newSession.save();
    } else {
      session.habits.push({
        habitName,
        description,
        frequency,
        targetDays,
        targetTime,
        reminderEnabled: true,
        streakCount: 0,
        createdAt: new Date(),
      });

      await session.save();
    }
  }

  /**
   * Send daily motivational boost
   */
  static async sendDailyMotivation(userId: string): Promise<MotivationBoost> {
    const profile = await UserLearningProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    let message = '';
    let type: 'achievement' | 'encouragement' | 'tip' | 'quote' = 'encouragement';

    // Check for recent achievements
    if (profile && profile.learningPatterns.consistencyScore > 80) {
      type = 'achievement';
      message = `대단합니다! ${profile.learningPatterns.consistencyScore}%의 학습 일관성을 유지하고 계십니다! 🎉`;
    } else if (profile && profile.strongTopics.length > 0) {
      type = 'achievement';
      message = `${profile.strongTopics[0].topic}에서 ${(profile.strongTopics[0].successRate * 100).toFixed(1)}% 성공률을 기록했습니다! 계속 힘내세요! 💪`;
    } else {
      type = 'quote';
      const quotes = [
        '성공은 매일의 작은 노력이 쌓여 만들어집니다.',
        '오늘 할 수 있는 최선을 다하는 것, 그것이 성공입니다.',
        '꾸준함은 재능을 이깁니다.',
        '당신의 한계는 당신이 정합니다.',
        '작은 진전도 진전입니다. 오늘도 화이팅!',
      ];
      message = quotes[Math.floor(Math.random() * quotes.length)];
    }

    const boost: MotivationBoost = {
      type,
      message,
      deliveredAt: new Date(),
    };

    // Save to latest coaching session
    const session = await LearningCoachSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    if (session) {
      session.motivationBoosts.push(boost);
      await session.save();
    }

    return boost;
  }
}
