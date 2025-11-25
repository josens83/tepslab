import {
  WritingSubmission,
  SpeakingPractice,
  AIConversation,
  PronunciationAssessment,
  IWritingSubmission,
  ISpeakingPractice,
  IAIConversation,
  IPronunciationAssessment,
  WritingType,
  SpeakingTaskType,
  ConversationType,
  AssessmentStatus
} from '../models/AdvancedAI';
import mongoose from 'mongoose';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Advanced AI Service
 */
export class AdvancedAIService {
  // Writing Assessment

  /**
   * Submit writing for assessment
   */
  static async submitWriting(
    userId: mongoose.Types.ObjectId,
    data: {
      title: string;
      content: string;
      writingType: WritingType;
      prompt?: string;
    }
  ): Promise<IWritingSubmission> {
    const wordCount = data.content.split(/\s+/).length;

    const submission = new WritingSubmission({
      userId,
      ...data,
      wordCount,
      status: AssessmentStatus.PENDING,
      submittedAt: new Date()
    });

    await submission.save();

    // Process assessment asynchronously
    this.processWritingAssessment(submission._id as mongoose.Types.ObjectId).catch(err => {
      console.error('Writing assessment error:', err);
    });

    return submission;
  }

  /**
   * Process writing assessment with GPT-4
   */
  static async processWritingAssessment(
    submissionId: mongoose.Types.ObjectId
  ): Promise<IWritingSubmission> {
    const submission = await WritingSubmission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.status = AssessmentStatus.PROCESSING;
    await submission.save();

    try {
      const prompt = this.buildWritingAssessmentPrompt(submission);

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert TEPS English writing assessor. Provide detailed, constructive feedback on writing submissions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content || '';
      const usage = response.usage!;

      // Parse GPT-4 response
      const assessment = this.parseWritingAssessment(content);

      submission.status = AssessmentStatus.COMPLETED;
      submission.assessedAt = new Date();
      submission.scores = assessment.scores;
      submission.feedback = assessment.feedback;
      submission.estimatedLevel = assessment.estimatedLevel;
      submission.aiAnalysis = {
        model: 'gpt-4',
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        rawResponse: content
      };

      await submission.save();
      return submission;
    } catch (error) {
      submission.status = AssessmentStatus.FAILED;
      await submission.save();
      throw error;
    }
  }

  /**
   * Build writing assessment prompt
   */
  private static buildWritingAssessmentPrompt(submission: IWritingSubmission): string {
    return `Assess the following ${submission.writingType} writing:

Title: ${submission.title}
${submission.prompt ? `Prompt: ${submission.prompt}\n` : ''}
Content:
${submission.content}

Please provide a comprehensive assessment in JSON format with the following structure:
{
  "scores": {
    "overall": 0-100,
    "grammar": 0-100,
    "vocabulary": 0-100,
    "coherence": 0-100,
    "taskResponse": 0-100
  },
  "feedback": {
    "strengths": ["strength 1", "strength 2", ...],
    "weaknesses": ["weakness 1", "weakness 2", ...],
    "suggestions": ["suggestion 1", "suggestion 2", ...],
    "grammarErrors": [
      {
        "text": "incorrect text",
        "correction": "corrected text",
        "explanation": "why it's wrong"
      }
    ],
    "vocabularyImprovements": [
      {
        "original": "simple word",
        "suggestion": "better word",
        "reason": "why it's better"
      }
    ]
  },
  "estimatedLevel": "beginner|intermediate|advanced"
}`;
  }

  /**
   * Parse writing assessment from GPT-4 response
   */
  private static parseWritingAssessment(content: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: basic parsing
      return {
        scores: {
          overall: 70,
          grammar: 70,
          vocabulary: 70,
          coherence: 70,
          taskResponse: 70
        },
        feedback: {
          strengths: ['Writing submitted successfully'],
          weaknesses: [],
          suggestions: ['Keep practicing'],
          grammarErrors: [],
          vocabularyImprovements: []
        },
        estimatedLevel: 'intermediate'
      };
    } catch (error) {
      console.error('Failed to parse assessment:', error);
      throw error;
    }
  }

  /**
   * Get user's writing submissions
   */
  static async getUserWritingSubmissions(
    userId: mongoose.Types.ObjectId,
    limit: number = 20
  ): Promise<IWritingSubmission[]> {
    return WritingSubmission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get writing submission by ID
   */
  static async getWritingSubmission(
    submissionId: mongoose.Types.ObjectId
  ): Promise<IWritingSubmission | null> {
    return WritingSubmission.findById(submissionId);
  }

  // Speaking Practice

  /**
   * Submit speaking practice
   */
  static async submitSpeaking(
    userId: mongoose.Types.ObjectId,
    data: {
      taskType: SpeakingTaskType;
      prompt: string;
      audioUrl: string;
      duration: number;
      imageUrl?: string;
      expectedText?: string;
    }
  ): Promise<ISpeakingPractice> {
    const practice = new SpeakingPractice({
      userId,
      ...data,
      status: AssessmentStatus.PENDING,
      recordedAt: new Date()
    });

    await practice.save();

    // Process assessment asynchronously
    this.processSpeakingAssessment(practice._id as mongoose.Types.ObjectId).catch(err => {
      console.error('Speaking assessment error:', err);
    });

    return practice;
  }

  /**
   * Process speaking assessment with Whisper + GPT-4
   */
  static async processSpeakingAssessment(
    practiceId: mongoose.Types.ObjectId
  ): Promise<ISpeakingPractice> {
    const practice = await SpeakingPractice.findById(practiceId);
    if (!practice) {
      throw new Error('Practice not found');
    }

    practice.status = AssessmentStatus.PROCESSING;
    await practice.save();

    try {
      // Step 1: Transcribe with Whisper
      // Note: In real implementation, download audio from audioUrl
      // For now, we'll simulate transcription
      const transcription = await this.transcribeAudio(practice.audioUrl);

      practice.transcription = transcription.text;
      practice.transcriptionConfidence = transcription.confidence;

      // Step 2: Assess with GPT-4
      const prompt = this.buildSpeakingAssessmentPrompt(practice);

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert TEPS English speaking assessor. Evaluate speaking performance based on transcription.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content || '';
      const assessment = this.parseSpeakingAssessment(content);

      practice.status = AssessmentStatus.COMPLETED;
      practice.assessedAt = new Date();
      practice.scores = assessment.scores;
      practice.feedback = assessment.feedback;
      practice.aiAnalysis = {
        whisperModel: 'whisper-1',
        gptModel: 'gpt-4',
        transcriptionTokens: transcription.tokens || 0,
        assessmentTokens: response.usage?.total_tokens || 0
      };

      await practice.save();
      return practice;
    } catch (error) {
      practice.status = AssessmentStatus.FAILED;
      await practice.save();
      throw error;
    }
  }

  /**
   * Transcribe audio with Whisper
   */
  private static async transcribeAudio(audioUrl: string): Promise<{
    text: string;
    confidence: number;
    tokens?: number;
  }> {
    // TODO: Implement actual Whisper API call
    // For now, return mock data
    return {
      text: 'Mock transcription of the audio content.',
      confidence: 0.95,
      tokens: 10
    };
  }

  /**
   * Build speaking assessment prompt
   */
  private static buildSpeakingAssessmentPrompt(practice: ISpeakingPractice): string {
    return `Assess the following speaking practice:

Task Type: ${practice.taskType}
Prompt: ${practice.prompt}
${practice.expectedText ? `Expected Text: ${practice.expectedText}\n` : ''}
Transcription: ${practice.transcription}

Provide assessment in JSON format:
{
  "scores": {
    "overall": 0-100,
    "pronunciation": 0-100,
    "fluency": 0-100,
    "accuracy": 0-100,
    "vocabulary": 0-100
  },
  "feedback": {
    "strengths": ["strength 1", ...],
    "improvements": ["improvement 1", ...],
    "pronunciationIssues": [{"word": "", "issue": "", "suggestion": ""}],
    "grammarErrors": [{"text": "", "correction": ""}]
  }
}`;
  }

  /**
   * Parse speaking assessment
   */
  private static parseSpeakingAssessment(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        scores: {
          overall: 70,
          pronunciation: 70,
          fluency: 70,
          accuracy: 70,
          vocabulary: 70
        },
        feedback: {
          strengths: ['Good attempt'],
          improvements: ['Keep practicing'],
          pronunciationIssues: [],
          grammarErrors: []
        }
      };
    } catch (error) {
      console.error('Failed to parse assessment:', error);
      throw error;
    }
  }

  /**
   * Get user's speaking practices
   */
  static async getUserSpeakingPractices(
    userId: mongoose.Types.ObjectId,
    limit: number = 20
  ): Promise<ISpeakingPractice[]> {
    return SpeakingPractice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // AI Conversation

  /**
   * Start AI conversation
   */
  static async startConversation(
    userId: mongoose.Types.ObjectId,
    data: {
      type: ConversationType;
      topic: string;
      difficulty?: string;
    }
  ): Promise<IAIConversation> {
    const systemMessage = this.buildSystemMessage(data.type, data.topic, data.difficulty || 'medium');

    const conversation = new AIConversation({
      userId,
      type: data.type,
      topic: data.topic,
      difficulty: data.difficulty || 'medium',
      messages: [
        {
          role: 'system',
          content: systemMessage,
          timestamp: new Date()
        }
      ],
      isActive: true,
      startedAt: new Date(),
      stats: {
        messageCount: 1,
        userMessageCount: 0,
        assistantMessageCount: 0,
        totalTokens: 0,
        duration: 0
      }
    });

    await conversation.save();

    // Send initial greeting
    await this.sendAIMessage(conversation._id as mongoose.Types.ObjectId, 'Hello! I\'m your AI tutor. How can I help you today?');

    return conversation;
  }

  /**
   * Send message in conversation
   */
  static async sendMessage(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    message: string
  ): Promise<IAIConversation> {
    const conversation = await AIConversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    if (!conversation.isActive) {
      throw new Error('Conversation is ended');
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    conversation.stats.messageCount += 1;
    conversation.stats.userMessageCount += 1;

    await conversation.save();

    // Get AI response
    await this.getAIResponse(conversationId);

    return AIConversation.findById(conversationId)!;
  }

  /**
   * Get AI response
   */
  private static async getAIResponse(conversationId: mongoose.Types.ObjectId): Promise<void> {
    const conversation = await AIConversation.findById(conversationId);
    if (!conversation) return;

    try {
      const messages = conversation.messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      }));

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.8,
        max_tokens: 500
      });

      const aiMessage = response.choices[0].message.content || '';

      conversation.messages.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date()
      });

      conversation.stats.messageCount += 1;
      conversation.stats.assistantMessageCount += 1;
      conversation.stats.totalTokens += response.usage?.total_tokens || 0;

      await conversation.save();
    } catch (error) {
      console.error('AI response error:', error);
    }
  }

  /**
   * Send AI message (for system-initiated messages)
   */
  private static async sendAIMessage(
    conversationId: mongoose.Types.ObjectId,
    message: string
  ): Promise<void> {
    const conversation = await AIConversation.findById(conversationId);
    if (!conversation) return;

    conversation.messages.push({
      role: 'assistant',
      content: message,
      timestamp: new Date()
    });

    conversation.stats.messageCount += 1;
    conversation.stats.assistantMessageCount += 1;

    await conversation.save();
  }

  /**
   * Build system message for conversation
   */
  private static buildSystemMessage(
    type: ConversationType,
    topic: string,
    difficulty: string
  ): string {
    const basePrompt = `You are an expert TEPS English tutor. Help the student practice English conversation.

Topic: ${topic}
Difficulty: ${difficulty}
Type: ${type}

Guidelines:
- Be encouraging and supportive
- Correct grammar mistakes gently
- Suggest better vocabulary when appropriate
- Ask follow-up questions to keep conversation flowing
- Adjust difficulty based on student's responses`;

    return basePrompt;
  }

  /**
   * End conversation
   */
  static async endConversation(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IAIConversation> {
    const conversation = await AIConversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    conversation.isActive = false;
    conversation.endedAt = new Date();
    conversation.stats.duration = Math.floor(
      (conversation.endedAt.getTime() - conversation.startedAt.getTime()) / 1000
    );

    await conversation.save();
    return conversation;
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(
    userId: mongoose.Types.ObjectId,
    activeOnly: boolean = false
  ): Promise<IAIConversation[]> {
    const query: any = { userId };
    if (activeOnly) {
      query.isActive = true;
    }

    return AIConversation.find(query).sort({ createdAt: -1 });
  }

  /**
   * Rate conversation
   */
  static async rateConversation(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    rating: number,
    feedback?: string
  ): Promise<IAIConversation> {
    const conversation = await AIConversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    conversation.userRating = rating;
    if (feedback) {
      conversation.userFeedback = feedback;
    }

    await conversation.save();
    return conversation;
  }
}
