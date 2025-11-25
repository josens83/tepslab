import mongoose, { Document } from 'mongoose';
import { TEPSSection } from './TEPSQuestion';
/**
 * Exam Type
 */
export declare enum ExamType {
    OFFICIAL_SIMULATION = "official_simulation",// Full 135-minute exam
    SECTION_PRACTICE = "section_practice",// Practice one section
    MICRO_LEARNING = "micro_learning",// 5/10/15 minute sessions
    ADAPTIVE_TEST = "adaptive_test",// Adaptive difficulty
    MOCK_TEST = "mock_test"
}
/**
 * Exam Difficulty
 */
export declare enum ExamDifficulty {
    BEGINNER = "beginner",// Target 200-300
    INTERMEDIATE = "intermediate",// Target 300-400
    ADVANCED = "advanced",// Target 400-500
    EXPERT = "expert",// Target 500-600
    ADAPTIVE = "adaptive"
}
/**
 * Exam Status
 */
export declare enum ExamStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    PAUSED = "paused",
    COMPLETED = "completed",
    ABANDONED = "abandoned",
    EXPIRED = "expired"
}
/**
 * Section Configuration
 */
export interface SectionConfig {
    section: TEPSSection;
    questionCount: number;
    timeLimit: number;
    questions: mongoose.Types.ObjectId[];
}
/**
 * Exam Configuration
 */
export interface IExamConfig {
    name: string;
    description: string;
    examType: ExamType;
    difficulty: ExamDifficulty;
    totalTimeLimit: number;
    timePerSection: boolean;
    allowPause: boolean;
    maxPauseDuration?: number;
    sections: SectionConfig[];
    allowReview: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showTimer: boolean;
    autoSubmit: boolean;
    showScoreImmediately: boolean;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    isOfficialFormat: boolean;
    examDate?: Date;
}
/**
 * User Answer
 */
export interface UserAnswer {
    questionId: mongoose.Types.ObjectId;
    section: TEPSSection;
    selectedAnswer: 'A' | 'B' | 'C' | 'D';
    timeSpent: number;
    isCorrect?: boolean;
    markedForReview: boolean;
    answeredAt: Date;
}
/**
 * Section Result
 */
export interface SectionResult {
    section: TEPSSection;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    timeSpent: number;
    score: number;
    percentile?: number;
}
/**
 * Exam Result
 */
export interface IExamResult {
    totalScore: number;
    percentile: number;
    estimatedLevel: string;
    sectionResults: SectionResult[];
    totalTimeSpent: number;
    averageTimePerQuestion: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    finalAbility: number;
    abilityChange: number;
    measurementError: number;
    comparedToAverage: number;
    scoreDistribution: {
        range: string;
        percentage: number;
    }[];
}
/**
 * TEPS Exam Attempt Document
 */
export interface ITEPSExamAttempt extends Document {
    userId: mongoose.Types.ObjectId;
    examConfigId: mongoose.Types.ObjectId;
    examType: ExamType;
    difficulty: ExamDifficulty;
    status: ExamStatus;
    startedAt?: Date;
    completedAt?: Date;
    pausedAt?: Date;
    totalPausedTime: number;
    expiresAt?: Date;
    answers: UserAnswer[];
    currentQuestionIndex: number;
    currentSection: TEPSSection;
    result?: IExamResult;
    ipAddress?: string;
    userAgent?: string;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    tabSwitches: number;
    fullscreenExits: number;
    suspiciousActivity: boolean;
    proctoring?: {
        webcamEnabled: boolean;
        faceDetected: boolean;
        multipleFacesDetected: boolean;
        recordingUrl?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    calculateResult(): Promise<IExamResult>;
    submitAnswer(questionId: string, answer: string, timeSpent: number): Promise<void>;
    pauseExam(): Promise<void>;
    resumeExam(): Promise<void>;
    completeExam(): Promise<void>;
}
export declare const TEPSExamAttempt: mongoose.Model<ITEPSExamAttempt, {}, {}, {}, mongoose.Document<unknown, {}, ITEPSExamAttempt, {}, {}> & ITEPSExamAttempt & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TEPSExam.d.ts.map