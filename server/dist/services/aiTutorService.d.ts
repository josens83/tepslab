interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface TutorResponse {
    answer: string;
    suggestions?: string[];
    relatedTopics?: string[];
}
/**
 * TEPS AI Tutor Service
 * Provides intelligent tutoring for TEPS preparation
 */
export declare class AITutorService {
    private systemPrompt;
    /**
     * Chat with AI tutor
     */
    chat(message: string, conversationHistory?: ChatMessage[], context?: {
        topic?: string;
        difficulty?: string;
        targetScore?: number;
    }): Promise<TutorResponse>;
    /**
     * Explain a TEPS question
     */
    explainQuestion(question: string, options: string[], correctAnswer: string, userAnswer?: string): Promise<string>;
    /**
     * Analyze student's weak points
     */
    analyzeWeakPoints(testResults: Array<{
        category: string;
        score: number;
        totalQuestions: number;
        incorrectQuestions: string[];
    }>): Promise<string>;
    /**
     * Generate practice questions
     */
    generatePracticeQuestions(category: string, difficulty: string, count?: number): Promise<Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    }>>;
    /**
     * Evaluate pronunciation (text-based analysis)
     */
    evaluatePronunciation(targetText: string, transcribedText: string): Promise<{
        score: number;
        feedback: string;
        mistakes: string[];
        suggestions: string[];
    }>;
    /**
     * Extract suggestions from response
     */
    private extractSuggestions;
    /**
     * Extract related topics from response
     */
    private extractRelatedTopics;
}
export declare const aiTutorService: AITutorService;
export {};
//# sourceMappingURL=aiTutorService.d.ts.map