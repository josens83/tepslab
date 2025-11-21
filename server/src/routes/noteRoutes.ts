import express from 'express';
import {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
} from '../controllers/noteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.get('/search', searchNotes);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

export default router;
