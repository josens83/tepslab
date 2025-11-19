export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  courseId: string | {
    _id: string;
    title: string;
    thumbnailUrl?: string;
    instructor: string;
  };
  rating: number;
  title: string;
  comment: string;
  beforeScore?: number;
  afterScore?: number;
  studyDuration?: number;
  isVerified: boolean;
  isPublished: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}
