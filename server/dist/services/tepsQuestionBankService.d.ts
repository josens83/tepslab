import { ITEPSQuestion, TEPSQuestionType, TEPSSection, DifficultyLevel } from '../models/TEPSQuestion';
/**
 * Question Generation Request
 */
export interface QuestionGenerationRequest {
    section: TEPSSection;
    questionType: TEPSQuestionType;
    difficultyLevel: DifficultyLevel;
    topic: string;
    count?: number;
    style?: 'official' | 'practice' | 'challenge';
}
/**
 * Question Filter for Search
 */
export interface QuestionFilter {
    section?: TEPSSection;
    questionType?: TEPSQuestionType;
    difficultyLevel?: DifficultyLevel | DifficultyLevel[];
    topic?: string;
    tags?: string[];
    isOfficialQuestion?: boolean;
    reviewStatus?: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    minQualityScore?: number;
}
/**
 * Adaptive Question Selection Criteria
 */
export interface AdaptiveSelectionCriteria {
    userId: string;
    targetScore: number;
    currentAbility: number;
    weakTopics: string[];
    recentQuestions: string[];
    preferredDifficulty?: DifficultyLevel;
}
/**
 * TEPS Question Bank Service
 * Manages the massive question database and AI-based question generation
 */
export declare class TEPSQuestionBankService {
    /**
     * Generate questions using AI (OpenAI GPT-4)
     */
    static generateQuestionsWithAI(request: QuestionGenerationRequest): Promise<ITEPSQuestion[]>;
    /**
     * Build generation prompt based on request
     */
    private static buildGenerationPrompt;
    /**
     * Get system prompt for specific section
     */
    private static getSystemPromptForSection;
    /**
     * Create question document from AI-generated data
     */
    private static createQuestionFromAI;
    /**
     * Search questions with filters
     */
    static searchQuestions(filter: QuestionFilter, limit?: number, skip?: number): Promise<{
        questions: ITEPSQuestion[];
        total: number;
    }>;
    /**
     * Get adaptive question selection using IRT
     * Selects questions that are most informative for user's current ability level
     */
    static selectAdaptiveQuestions(criteria: AdaptiveSelectionCriteria, count?: number): Promise<ITEPSQuestion[]>;
    /**
     * Convert ability (theta) to difficulty level (1-5)
     */
    private static abilityToDifficulty;
    /**
     * Calculate information value of a question for given ability
     * Based on IRT information function
     */
    private static calculateInformationValue;
    /**
     * Get question statistics and analytics
     */
    static getQuestionBankStats(): Promise<{
        totalQuestions: number;
        bySection: Record<string, number>;
        byDifficulty: Record<string, number>;
        byType: Record<string, number>;
        officialQuestions: number;
        aiGenerated: number;
        averageQualityScore: number;
    }>;
    /**
     * Analyze official TEPS question patterns
     */
    static analyzeOfficialPatterns(section: TEPSSection): Promise<{
        commonTopics: Array<{
            topic: string;
            frequency: number;
        }>;
        difficultyDistribution: Record<number, number>;
        averageQuestionLength: number;
        commonKeywords: Array<{
            keyword: string;
            frequency: number;
        }>;
    }>;
    /**
     * Bulk import questions from CSV or JSON
     */
    static bulkImportQuestions(questions: Partial<ITEPSQuestion>[], source: 'official' | 'manual' | 'import'): Promise<{
        imported: number;
        failed: number;
        errors: string[];
    }>;
}
//# sourceMappingURL=tepsQuestionBankService.d.ts.map