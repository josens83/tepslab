import { ITEPSExamConfig } from '../models/TEPSExamConfig';
import { ITEPSExamAttempt, ExamType, ExamDifficulty } from '../models/TEPSExam';
import { TEPSSection } from '../models/TEPSQuestion';
/**
 * Exam Creation Request
 */
export interface CreateExamRequest {
    userId: string;
    examType: ExamType;
    difficulty?: ExamDifficulty;
    sections?: TEPSSection[];
    duration?: number;
    useTemplate?: string;
}
/**
 * TEPS Exam Service
 * Handles CBT exam creation, management, and scoring
 */
export declare class TEPSExamService {
    /**
     * Create official TEPS simulation exam
     */
    static createOfficialSimulation(userId: string, difficulty?: ExamDifficulty): Promise<ITEPSExamAttempt>;
    /**
     * Create official exam config template
     */
    private static createOfficialExamConfig;
    /**
     * Select questions for exam config based on user level
     */
    private static selectQuestionsForConfig;
    /**
     * Get difficulty levels for section based on exam difficulty and user profile
     */
    private static getDifficultyForSection;
    /**
     * Create micro-learning session (5/10/15 minutes)
     */
    static createMicroLearningSession(userId: string, duration: number, // 5, 10, or 15 minutes
    section?: TEPSSection): Promise<ITEPSExamAttempt>;
    /**
     * Create section practice exam
     */
    static createSectionPractice(userId: string, section: TEPSSection, questionCount?: number, difficulty?: ExamDifficulty): Promise<ITEPSExamAttempt>;
    /**
     * Start exam attempt
     */
    static startExam(attemptId: string): Promise<ITEPSExamAttempt>;
    /**
     * Get exam questions with attempt details
     */
    static getExamQuestions(attemptId: string): Promise<{
        attempt: ITEPSExamAttempt;
        config: ITEPSExamConfig;
        questions: any[];
    }>;
    /**
     * Submit answer
     */
    static submitAnswer(attemptId: string, questionId: string, answer: string, timeSpent: number): Promise<void>;
    /**
     * Complete exam
     */
    static completeExam(attemptId: string): Promise<ITEPSExamAttempt>;
    /**
     * Get user exam history
     */
    static getUserExamHistory(userId: string, examType?: ExamType, limit?: number, skip?: number): Promise<{
        attempts: ITEPSExamAttempt[];
        total: number;
    }>;
    /**
     * Get exam statistics
     */
    static getExamStatistics(userId: string): Promise<{
        totalExamsTaken: number;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        recentProgress: {
            date: string;
            score: number;
        }[];
        sectionAverages: {
            section: string;
            average: number;
        }[];
    }>;
    /**
     * Helper: Shuffle array
     */
    private static shuffleArray;
    /**
     * Helper: Shuffle answer options while maintaining correct answer
     */
    private static shuffleOptions;
}
//# sourceMappingURL=tepsExamService.d.ts.map