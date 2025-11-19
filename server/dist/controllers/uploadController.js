"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.deleteFile = exports.uploadVideo = exports.uploadMultipleImages = exports.uploadImage = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * 이미지 업로드
 * POST /api/uploads/image
 */
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
            return;
        }
        const fileUrl = `/uploads/images/${req.file.filename}`;
        res.status(200).json({
            success: true,
            data: {
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    }
    catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: '이미지 업로드 중 오류가 발생했습니다.' });
    }
};
exports.uploadImage = uploadImage;
/**
 * 다중 이미지 업로드
 * POST /api/uploads/images
 */
const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
            return;
        }
        const files = req.files.map((file) => ({
            url: `/uploads/images/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
        }));
        res.status(200).json({
            success: true,
            data: { files },
        });
    }
    catch (error) {
        console.error('Upload multiple images error:', error);
        res.status(500).json({ error: '이미지 업로드 중 오류가 발생했습니다.' });
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
/**
 * 비디오 업로드
 * POST /api/uploads/video
 */
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
            return;
        }
        const fileUrl = `/uploads/videos/${req.file.filename}`;
        res.status(200).json({
            success: true,
            data: {
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    }
    catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({ error: '비디오 업로드 중 오류가 발생했습니다.' });
    }
};
exports.uploadVideo = uploadVideo;
/**
 * 파일 삭제
 * DELETE /api/uploads/:filename
 */
const deleteFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const { folder } = req.query;
        if (!filename) {
            res.status(400).json({ error: '파일명이 필요합니다.' });
            return;
        }
        // Determine folder
        let uploadFolder = 'uploads';
        if (folder === 'images')
            uploadFolder = 'uploads/images';
        else if (folder === 'videos')
            uploadFolder = 'uploads/videos';
        else if (folder === 'documents')
            uploadFolder = 'uploads/documents';
        const filePath = path_1.default.join(process.cwd(), uploadFolder, filename);
        // Security check - prevent directory traversal
        if (!filePath.startsWith(path_1.default.join(process.cwd(), 'uploads'))) {
            res.status(400).json({ error: '잘못된 파일 경로입니다.' });
            return;
        }
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
            return;
        }
        fs_1.default.unlinkSync(filePath);
        res.status(200).json({
            success: true,
            message: '파일이 삭제되었습니다.',
        });
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
    }
};
exports.deleteFile = deleteFile;
/**
 * 아바타 업로드
 * POST /api/uploads/avatar
 */
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
            return;
        }
        const fileUrl = `/uploads/images/${req.file.filename}`;
        // TODO: Update user avatar in database
        // const userId = req.user?._id;
        // await User.findByIdAndUpdate(userId, { avatar: fileUrl });
        res.status(200).json({
            success: true,
            data: {
                url: fileUrl,
                filename: req.file.filename,
            },
        });
    }
    catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: '아바타 업로드 중 오류가 발생했습니다.' });
    }
};
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=uploadController.js.map