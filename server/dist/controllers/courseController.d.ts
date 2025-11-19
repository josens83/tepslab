import { Request, Response } from 'express';
import { AuthRequest } from '../types';
/**
 * @route   GET /api/courses
 * @desc    Get all courses with filtering and pagination
 * @access  Public
 */
export declare const getCourses: (req: Request, res: Response) => Promise<void>;
/**
 * @route   GET /api/courses/featured
 * @desc    Get featured courses
 * @access  Public
 */
export declare const getFeaturedCourses: (_req: Request, res: Response) => Promise<void>;
/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID
 * @access  Public
 */
export declare const getCourseById: (req: Request, res: Response) => Promise<void>;
/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin only)
 * @access  Private/Admin
 */
export declare const createCourse: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course (Admin only)
 * @access  Private/Admin
 */
export declare const updateCourse: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course (Admin only)
 * @access  Private/Admin
 */
export declare const deleteCourse: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @route   GET /api/courses/:id/check-enrollment
 * @desc    Check if user is enrolled in course
 * @access  Private
 */
export declare const checkEnrollment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=courseController.d.ts.map