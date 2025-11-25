import mongoose, { Document } from 'mongoose';
/**
 * TEPS Question Types
 */
export declare enum TEPSQuestionType {
    LISTENING_SHORT_CONVERSATION = "listening_short_conversation",
    LISTENING_LONG_CONVERSATION = "listening_long_conversation",
    LISTENING_SHORT_TALK = "listening_short_talk",
    LISTENING_LONG_TALK = "listening_long_talk",
    VOCABULARY_DEFINITION = "vocabulary_definition",
    VOCABULARY_CONTEXT = "vocabulary_context",
    VOCABULARY_SYNONYM = "vocabulary_synonym",
    GRAMMAR_ERROR_IDENTIFICATION = "grammar_error_identification",
    GRAMMAR_BLANK_FILLING = "grammar_blank_filling",
    GRAMMAR_SENTENCE_COMPLETION = "grammar_sentence_completion",
    READING_MAIN_IDEA = "reading_main_idea",
    READING_DETAIL = "reading_detail",
    READING_INFERENCE = "reading_inference",
    READING_VOCABULARY_IN_CONTEXT = "reading_vocabulary_in_context",
    READING_ORGANIZATION = "reading_organization"
}
/**
 * TEPS Section Classification
 */
export declare enum TEPSSection {
    LISTENING = "listening",
    VOCABULARY = "vocabulary",
    GRAMMAR = "grammar",
    READING = "reading"
}
/**
 * Difficulty Level (based on IRT)
 */
export declare enum DifficultyLevel {
    VERY_EASY = 1,
    EASY = 2,
    MEDIUM = 3,
    HARD = 4,
    VERY_HARD = 5
}
/**
 * Question Statistics for IRT
 */
export interface QuestionStatistics {
    difficulty: number;
    discrimination: number;
    guessing: number;
    timesUsed: number;
    timesCorrect: number;
    timesIncorrect: number;
    averageTimeSpent: number;
    performanceByLevel: {
        level: string;
        correctRate: number;
        sampleSize: number;
    }[];
}
/**
 * Audio Resource for Listening Questions
 */
export interface AudioResource {
    url: string;
    duration: number;
    transcript: string;
    speakers: number;
    accentType: 'american' | 'british' | 'canadian' | 'australian';
}
/**
 * Reading Passage for Reading Questions
 */
export interface ReadingPassage {
    content: string;
    wordCount: number;
    readingLevel: string;
    genre: 'academic' | 'business' | 'news' | 'literature' | 'science';
    topic: string;
}
/**
 * TEPS Question Interface
 */
export interface ITEPSQuestion extends Document {
    questionType: TEPSQuestionType;
    section: TEPSSection;
    difficultyLevel: DifficultyLevel;
    questionText: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    audioResource?: AudioResource;
    readingPassage?: ReadingPassage;
    imageUrl?: string;
    explanation: string;
    keyPoints: string[];
    relatedConcepts: string[];
    tips: string[];
    topic: string;
    subtopic?: string;
    tags: string[];
    keywords: string[];
    isOfficialQuestion: boolean;
    examYear?: number;
    examMonth?: number;
    officialQuestionNumber?: number;
    statistics: QuestionStatistics;
    prerequisiteKnowledge: string[];
    learningObjectives: string[];
    reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    qualityScore: number;
    isAIGenerated: boolean;
    generationMethod?: 'openai' | 'pattern_based' | 'manual';
    generatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    calculateDifficulty(): number;
    updateStatistics(isCorrect: boolean, timeSpent: number, userLevel: number): Promise<void>;
    getSimilarQuestions(limit: number): Promise<ITEPSQuestion[]>;
}
export declare const TEPSQuestion: mongoose.Model<ITEPSQuestion, {}, {}, {}, mongoose.Document<unknown, {}, ITEPSQuestion, {}, {}> & ITEPSQuestion & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TEPSQuestion.d.ts.map