import { Request, Response } from 'express';
import Bookmark from '../models/Bookmark';

// Get all bookmarks for a user
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId } = req.query;
    const userId = (req as any).user.id;

    const filter: any = { userId };

    if (courseId) filter.courseId = courseId;
    if (lessonId) filter.lessonId = lessonId;

    const bookmarks = await Bookmark.find(filter)
      .populate('courseId', 'title thumbnail')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmarks',
    });
  }
};

// Create a new bookmark
export const createBookmark = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { courseId, lessonId, videoTimestamp, note } = req.body;

    const bookmark = await Bookmark.create({
      userId,
      courseId,
      lessonId,
      videoTimestamp,
      note,
    });

    await bookmark.populate('courseId', 'title thumbnail');
    if (lessonId) {
      await bookmark.populate('lessonId', 'title');
    }

    res.status(201).json({
      success: true,
      message: 'Bookmark created successfully',
      data: bookmark,
    });
  } catch (error: any) {
    console.error('Create bookmark error:', error);

    // Handle duplicate bookmark error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Bookmark already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create bookmark',
    });
  }
};

// Get bookmark by ID
export const getBookmarkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const bookmark = await Bookmark.findOne({ _id: id, userId })
      .populate('courseId', 'title thumbnail')
      .populate('lessonId', 'title');

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
    }

    res.json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    console.error('Get bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmark',
    });
  }
};

// Update bookmark
export const updateBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { note } = req.body;

    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: id, userId },
      { note },
      { new: true, runValidators: true }
    )
      .populate('courseId', 'title thumbnail')
      .populate('lessonId', 'title');

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
    }

    res.json({
      success: true,
      message: 'Bookmark updated successfully',
      data: bookmark,
    });
  } catch (error) {
    console.error('Update bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bookmark',
    });
  }
};

// Delete bookmark
export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const bookmark = await Bookmark.findOneAndDelete({ _id: id, userId });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
    }

    res.json({
      success: true,
      message: 'Bookmark deleted successfully',
    });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookmark',
    });
  }
};

// Delete all bookmarks for a course
export const deleteBookmarksByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;

    const result = await Bookmark.deleteMany({ userId, courseId });

    res.json({
      success: true,
      message: `${result.deletedCount} bookmark(s) deleted`,
    });
  } catch (error) {
    console.error('Delete bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookmarks',
    });
  }
};
