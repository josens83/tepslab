import mongoose, { Document } from 'mongoose';
export interface INote extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    title: string;
    content: string;
    videoTimestamp?: number;
    tags: string[];
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}, {}> & INote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Note.d.ts.map