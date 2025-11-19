import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * �� �1
 * POST /api/reviews
 */
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * X� �� �] p�
 * GET /api/reviews/course/:courseId
 */
export declare const getCourseReviews: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * � �� �] p�
 * GET /api/reviews/my
 */
export declare const getMyReviews: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * �� 
 * PUT /api/reviews/:id
 */
export declare const updateReview: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * �� �
 * DELETE /api/reviews/:id
 */
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * �� ��( \�
 * POST /api/reviews/:id/helpful
 */
export declare const markHelpful: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=reviewController.d.ts.map