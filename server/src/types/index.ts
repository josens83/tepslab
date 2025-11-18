import { Request } from 'express';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  phone?: string;
  birthDate?: Date;
  targetScore?: number;
  currentLevel?: string;
  provider?: 'local' | 'kakao' | 'naver';
  providerId?: string;
  role: 'student' | 'admin';
  isEmailVerified: boolean;
  enrolledCourses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
