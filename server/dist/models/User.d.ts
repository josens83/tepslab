import mongoose, { Document } from 'mongoose';
export interface IUserDocument extends Document {
    email: string;
    name: string;
    password?: string;
    phone?: string;
    birthDate?: Date;
    targetScore?: number;
    currentLevel?: string;
    provider: 'local' | 'kakao' | 'naver';
    providerId?: string;
    role: 'student' | 'admin';
    isEmailVerified: boolean;
    enrolledCourses: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map