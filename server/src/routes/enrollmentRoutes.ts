import { Router } from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentById,
  updateProgress,
  cancelEnrollment,
} from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All enrollment routes require authentication
router.use(authenticate);

router.post('/', enrollCourse);
router.get('/', getMyEnrollments);
router.get('/:id', getEnrollmentById);
router.put('/:id/progress', updateProgress);
router.delete('/:id', cancelEnrollment);

export default router;
