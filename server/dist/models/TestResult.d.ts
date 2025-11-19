import mongoose, { Document } from 'mongoose';
export interface IAnswerDetail {
    questionId: mongoose.Types.ObjectId;
    questionNumber: number;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeSpent?: number;
}
export interface IScoreBreakdown {
    grammar: {
        correct: number;
        total: number;
    };
    vocabulary: {
        correct: number;
        total: number;
    };
    listening: {
        correct: number;
        total: number;
    };
    reading: {
        correct: number;
        total: number;
    };
}
export interface ITestResult extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    testId: mongoose.Types.ObjectId;
    answers: IAnswerDetail[];
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    scoreBreakdown: IScoreBreakdown;
    estimatedScore: number;
    timeSpent: number;
    isPassed: boolean;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TestResult: mongoose.Model<ITestResult, {}, {}, {}, mongoose.Document<unknown, {}, ITestResult, {}, {}> & ITestResult & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TestResult.d.ts.map