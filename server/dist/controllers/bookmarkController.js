"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookmarksByCourse = exports.deleteBookmark = exports.updateBookmark = exports.getBookmarkById = exports.createBookmark = exports.getBookmarks = void 0;
const Bookmark_1 = __importDefault(require("../models/Bookmark"));
// Get all bookmarks for a user
const getBookmarks = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query;
        const userId = req.user.id;
        const filter = { userId };
        if (courseId)
            filter.courseId = courseId;
        if (lessonId)
            filter.lessonId = lessonId;
        const bookmarks = await Bookmark_1.default.find(filter)
            .populate('courseId', 'title thumbnail')
            .populate('lessonId', 'title')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: bookmarks,
        });
    }
    catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookmarks',
        });
    }
};
exports.getBookmarks = getBookmarks;
// Create a new bookmark
const createBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lessonId, videoTimestamp, note } = req.body;
        const bookmark = await Bookmark_1.default.create({
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
    }
    catch (error) {
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
exports.createBookmark = createBookmark;
// Get bookmark by ID
const getBookmarkById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const bookmark = await Bookmark_1.default.findOne({ _id: id, userId })
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
    }
    catch (error) {
        console.error('Get bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookmark',
        });
    }
};
exports.getBookmarkById = getBookmarkById;
// Update bookmark
const updateBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { note } = req.body;
        const bookmark = await Bookmark_1.default.findOneAndUpdate({ _id: id, userId }, { note }, { new: true, runValidators: true })
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
    }
    catch (error) {
        console.error('Update bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update bookmark',
        });
    }
};
exports.updateBookmark = updateBookmark;
// Delete bookmark
const deleteBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const bookmark = await Bookmark_1.default.findOneAndDelete({ _id: id, userId });
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
    }
    catch (error) {
        console.error('Delete bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete bookmark',
        });
    }
};
exports.deleteBookmark = deleteBookmark;
// Delete all bookmarks for a course
const deleteBookmarksByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const result = await Bookmark_1.default.deleteMany({ userId, courseId });
        res.json({
            success: true,
            message: `${result.deletedCount} bookmark(s) deleted`,
        });
    }
    catch (error) {
        console.error('Delete bookmarks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete bookmarks',
        });
    }
};
exports.deleteBookmarksByCourse = deleteBookmarksByCourse;
//# sourceMappingURL=bookmarkController.js.map