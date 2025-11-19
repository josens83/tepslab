import { Router } from 'express';
import {
  getCourses,
  getFeaturedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  checkEnrollment,
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/:id', getCourseById);

// Protected routes
router.get('/:id/check-enrollment', authenticate, checkEnrollment);

// Admin routes
router.post('/', authenticate, authorize('admin'), createCourse);
router.put('/:id', authenticate, authorize('admin'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

export default router;
