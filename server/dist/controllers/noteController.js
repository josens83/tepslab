"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotes = exports.deleteNote = exports.updateNote = exports.getNoteById = exports.createNote = exports.getNotes = void 0;
const Note_1 = __importDefault(require("../models/Note"));
// Get all notes for a user
const getNotes = async (req, res) => {
    try {
        const { courseId, lessonId, tags, isPinned } = req.query;
        const userId = req.user.id;
        const filter = { userId };
        if (courseId)
            filter.courseId = courseId;
        if (lessonId)
            filter.lessonId = lessonId;
        if (isPinned !== undefined)
            filter.isPinned = isPinned === 'true';
        if (tags) {
            const tagArray = tags.split(',');
            filter.tags = { $in: tagArray };
        }
        const notes = await Note_1.default.find(filter)
            .populate('courseId', 'title')
            .populate('lessonId', 'title')
            .sort({ isPinned: -1, createdAt: -1 });
        res.json({
            success: true,
            data: notes,
        });
    }
    catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notes',
        });
    }
};
exports.getNotes = getNotes;
// Create a new note
const createNote = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lessonId, title, content, videoTimestamp, tags } = req.body;
        const note = await Note_1.default.create({
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
    }
    catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create note',
        });
    }
};
exports.createNote = createNote;
// Get note by ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const note = await Note_1.default.findOne({ _id: id, userId })
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
    }
    catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get note',
        });
    }
};
exports.getNoteById = getNoteById;
// Update note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, content, tags, isPinned } = req.body;
        const note = await Note_1.default.findOneAndUpdate({ _id: id, userId }, { title, content, tags, isPinned }, { new: true, runValidators: true })
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
    }
    catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update note',
        });
    }
};
exports.updateNote = updateNote;
// Delete note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const note = await Note_1.default.findOneAndDelete({ _id: id, userId });
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
    }
    catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete note',
        });
    }
};
exports.deleteNote = deleteNote;
// Search notes
const searchNotes = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }
        const notes = await Note_1.default.find({
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
    }
    catch (error) {
        console.error('Search notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search notes',
        });
    }
};
exports.searchNotes = searchNotes;
//# sourceMappingURL=noteController.js.map