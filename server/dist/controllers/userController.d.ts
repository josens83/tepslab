import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * 프로필 조회
 * GET /api/users/profile
 */
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 프로필 수정
 * PUT /api/users/profile
 */
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 비밀번호 변경
 * PUT /api/users/password
 */
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 회원 탈퇴
 * DELETE /api/users/account
 */
export declare const deleteAccount: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map