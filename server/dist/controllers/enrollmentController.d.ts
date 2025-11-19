import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * @route   POST /api/enrollments
 * @desc    Enroll in a course
 * @access  Private
 */
export declare const enrollCourse: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   GET /api/enrollments
 * @desc    Get user's enrollments
 * @access  Private
 */
export declare const getMyEnrollments: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   GET /api/enrollments/:id
 * @desc    Get single enrollment
 * @access  Private
 */
export declare const getEnrollmentById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   PUT /api/enrollments/:id/progress
 * @desc    Update lesson progress
 * @access  Private
 */
export declare const updateProgress: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Cancel enrollment (soft delete)
 * @access  Private
 */
export declare const cancelEnrollment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=enrollmentController.d.ts.map