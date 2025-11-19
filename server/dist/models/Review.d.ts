import mongoose, { Document } from 'mongoose';
export interface IReviewDocument extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    rating: number;
    title: string;
    comment: string;
    beforeScore?: number;
    afterScore?: number;
    studyDuration?: number;
    isVerified: boolean;
    isPublished: boolean;
    helpfulCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: mongoose.Model<IReviewDocument, {}, {}, {}, mongoose.Document<unknown, {}, IReviewDocument, {}, {}> & IReviewDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Review.d.ts.map