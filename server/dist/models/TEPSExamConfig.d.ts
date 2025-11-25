import mongoose, { Document } from 'mongoose';
import { IExamConfig } from './TEPSExam';
/**
 * TEPS Exam Config Document
 * Defines exam templates that can be used to create exam attempts
 */
export interface ITEPSExamConfig extends Document, IExamConfig {
    isActive: boolean;
    isPublic: boolean;
    createdBy: mongoose.Types.ObjectId;
    usageCount: number;
    averageScore: number;
    averageCompletionTime: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TEPSExamConfig: mongoose.Model<ITEPSExamConfig, {}, {}, {}, mongoose.Document<unknown, {}, ITEPSExamConfig, {}, {}> & ITEPSExamConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TEPSExamConfig.d.ts.map