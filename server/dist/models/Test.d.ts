import mongoose, { Document } from 'mongoose';
export interface IQuestion {
    _id: mongoose.Types.ObjectId;
    questionNumber: number;
    questionType: 'grammar' | 'vocabulary' | 'listening' | 'reading';
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    audioUrl?: string;
    imageUrl?: string;
}
export interface ITest extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    testType: 'diagnostic' | 'practice' | 'mock';
    targetScore: number;
    duration: number;
    questions: IQuestion[];
    totalQuestions: number;
    passingScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Test: mongoose.Model<ITest, {}, {}, {}, mongoose.Document<unknown, {}, ITest, {}, {}> & ITest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Test.d.ts.map