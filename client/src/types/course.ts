// Course types
export interface Lesson {
  _id?: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFree: boolean;
  materials?: string[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl?: string;
  targetScore: 327 | 387 | 450 | 550 | 600;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive';
  price: number;
  discountPrice?: number;
  duration: number;
  lessonsCount: number;
  lessons: Lesson[];
  features: string[];
  curriculum: string[];
  requirements: string[];
  isPublished: boolean;
  isFeatured: boolean;
  enrolledCount: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

// Enrollment types
export interface Progress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  lastWatchedAt: string;
  watchDuration: number;
}

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: Course | string;
  enrolledAt: string;
  expiresAt?: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  progress: Progress[];
  completionPercentage: number;
  lastAccessedAt: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  _id: string;
  userId: string;
  courseId: string;
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

// API response types
export interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CourseFilters {
  targetScore?: number;
  level?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
