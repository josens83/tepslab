import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * 이미지 업로드
 * POST /api/uploads/image
 */
export declare const uploadImage: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 다중 이미지 업로드
 * POST /api/uploads/images
 */
export declare const uploadMultipleImages: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 비디오 업로드
 * POST /api/uploads/video
 */
export declare const uploadVideo: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 파일 삭제
 * DELETE /api/uploads/:filename
 */
export declare const deleteFile: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 아바타 업로드
 * POST /api/uploads/avatar
 */
export declare const uploadAvatar: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=uploadController.d.ts.map