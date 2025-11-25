import mongoose, { Document } from 'mongoose';
export interface IBookmark extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    videoTimestamp?: number;
    note?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IBookmark, {}, {}, {}, mongoose.Document<unknown, {}, IBookmark, {}, {}> & IBookmark & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Bookmark.d.ts.map