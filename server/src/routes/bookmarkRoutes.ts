import express from 'express';
import {
  getBookmarks,
  createBookmark,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  deleteBookmarksByCourse,
} from '../controllers/bookmarkController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getBookmarks)
  .post(createBookmark);

router.route('/:id')
  .get(getBookmarkById)
  .put(updateBookmark)
  .delete(deleteBookmark);

router.delete('/course/:courseId', deleteBookmarksByCourse);

export default router;
