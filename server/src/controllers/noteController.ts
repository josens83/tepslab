import { Request, Response } from 'express';
import Note from '../models/Note';

// Get all notes for a user
export const getNotes = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId, tags, isPinned } = req.query;
    const userId = (req as any).user.id;

    const filter: any = { userId };

    if (courseId) filter.courseId = courseId;
    if (lessonId) filter.lessonId = lessonId;
    if (isPinned !== undefined) filter.isPinned = isPinned === 'true';
    if (tags) {
      const tagArray = (tags as string).split(',');
      filter.tags = { $in: tagArray };
    }

    const notes = await Note.find(filter)
      .populate('courseId', 'title')
      .populate('lessonId', 'title')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes',
    });
  }
};

// Create a new note
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { courseId, lessonId, title, content, videoTimestamp, tags } = req.body;

    const note = await Note.create({
      userId,
      courseId,
      lessonId,
      title,
      content,
      videoTimestamp,
      tags: tags || [],
    });

    await note.populate('courseId', 'title');
    if (lessonId) {
      await note.populate('lessonId', 'title');
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
    });
  }
};

// Get note by ID
export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const note = await Note.findOne({ _id: id, userId })
      .populate('courseId', 'title')
      .populate('lessonId', 'title');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get note',
    });
  }
};

// Update note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { title, content, tags, isPinned } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, content, tags, isPinned },
      { new: true, runValidators: true }
    )
      .populate('courseId', 'title')
      .populate('lessonId', 'title');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
    });
  }
};

// Delete note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
    });
  }
};

// Search notes
export const searchNotes = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const userId = (req as any).user.id;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const notes = await Note.find({
      userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('courseId', 'title')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search notes',
    });
  }
};
