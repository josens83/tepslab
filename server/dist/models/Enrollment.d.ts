import mongoose, { Document } from 'mongoose';
export interface IProgress {
    lessonId: string;
    completed: boolean;
    completedAt?: Date;
    lastWatchedAt: Date;
    watchDuration: number;
}
export interface IEnrollmentDocument extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    enrolledAt: Date;
    expiresAt?: Date;
    status: 'active' | 'completed' | 'expired' | 'cancelled';
    progress: IProgress[];
    completionPercentage: number;
    lastAccessedAt: Date;
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Enrollment: mongoose.Model<IEnrollmentDocument, {}, {}, {}, mongoose.Document<unknown, {}, IEnrollmentDocument, {}, {}> & IEnrollmentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Enrollment.d.ts.map