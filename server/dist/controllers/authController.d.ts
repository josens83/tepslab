import { Request, Response } from 'express';
import { AuthRequest } from '../types';
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export declare const getCurrentUser: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   GET /api/auth/kakao
 * @desc    Redirect to Kakao OAuth
 * @access  Public
 */
export declare const kakaoAuth: (_req: Request, res: Response) => void;
/**
 * @route   GET /api/auth/kakao/callback
 * @desc    Kakao OAuth callback
 * @access  Public
 */
export declare const kakaoCallback: (req: Request, res: Response) => Promise<void>;
/**
 * @route   GET /api/auth/naver
 * @desc    Redirect to Naver OAuth
 * @access  Public
 */
export declare const naverAuth: (_req: Request, res: Response) => void;
/**
 * @route   GET /api/auth/naver/callback
 * @desc    Naver OAuth callback
 * @access  Public
 */
export declare const naverCallback: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map