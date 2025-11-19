import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * 진단 테스트 목록 조회
 * GET /api/tests
 */
export declare const getTests: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 테스트 상세 조회 (문제 포함)
 * GET /api/tests/:id
 */
export declare const getTestById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 테스트 제출 및 채점
 * POST /api/tests/:id/submit
 */
export declare const submitTest: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 테스트 결과 상세 조회
 * GET /api/test-results/:id
 */
export declare const getTestResult: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 내 테스트 결과 목록 조회
 * GET /api/test-results
 */
export declare const getMyTestResults: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 관리자: 테스트 생성
 * POST /api/tests
 */
export declare const createTest: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=testController.d.ts.map