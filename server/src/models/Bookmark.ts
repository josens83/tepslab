import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  videoTimestamp?: number;
  note?: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    videoTimestamp: {
      type: Number,
      min: 0,
    },
    note: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for user + course
bookmarkSchema.index({ userId: 1, courseId: 1 });

// Prevent duplicate bookmarks
bookmarkSchema.index(
  { userId: 1, courseId: 1, lessonId: 1, videoTimestamp: 1 },
  { unique: true, sparse: true }
);

// Methods
bookmarkSchema.methods.toJSON = function () {
  const bookmark = this.toObject();
  bookmark.id = bookmark._id;
  delete bookmark._id;
  delete bookmark.__v;
  return bookmark;
};

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
