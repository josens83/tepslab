import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * 관리자 대시보드 통계
 * GET /api/admin/stats
 */
export declare const getDashboardStats: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * 회원 목록 조회
 * GET /api/admin/users
 */
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 회원 상태 변경
 * PUT /api/admin/users/:id/status
 */
export declare const updateUserStatus: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 강의 목록 조회 (관리자용)
 * GET /api/admin/courses
 */
export declare const getAdminCourses: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map