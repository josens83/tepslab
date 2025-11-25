import { Request } from 'express';

export interface IUser {
  _id: string;
  id?: string; // Alias for _id
  userId?: string; // Alias for _id, used in some controllers
  email: string;
  name: string;
  password?: string;
  phone?: string;
  birthDate?: Date;
  targetScore?: number;
  currentLevel?: string;
  provider?: 'local' | 'kakao' | 'naver' | 'google' | 'facebook' | 'github' | 'apple';
  providerId?: string;
  role: 'student' | 'instructor' | 'admin';
  isEmailVerified: boolean;
  enrolledCourses: string[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

// Global Express Request extension
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
