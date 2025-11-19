import mongoose, { Document } from 'mongoose';
export interface ILesson {
    title: string;
    description: string;
    videoUrl?: string;
    duration: number;
    order: number;
    isFree: boolean;
    materials?: string[];
}
export interface ICourseDocument extends Document {
    title: string;
    description: string;
    instructor: string;
    thumbnailUrl?: string;
    targetScore: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive';
    price: number;
    discountPrice?: number;
    duration: number;
    lessonsCount: number;
    lessons: ILesson[];
    features: string[];
    curriculum: string[];
    requirements: string[];
    isPublished: boolean;
    isFeatured: boolean;
    enrolledCount: number;
    rating: number;
    reviewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Course: mongoose.Model<ICourseDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICourseDocument, {}, {}> & ICourseDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Course.d.ts.map