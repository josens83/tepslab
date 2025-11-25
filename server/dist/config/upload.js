"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalUpload = exports.videoUpload = exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/documents'];
uploadDirs.forEach((dir) => {
    const fullPath = path_1.default.join(process.cwd(), dir);
    if (!fs_1.default.existsSync(fullPath)) {
        fs_1.default.mkdirSync(fullPath, { recursive: true });
    }
});
// File filter for images
const imageFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)'));
    }
};
// File filter for videos
const videoFilter = (_req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('비디오 파일만 업로드 가능합니다. (mp4, webm, ogg)'));
    }
};
// Storage configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        let folder = 'uploads';
        if (file.mimetype.startsWith('image/')) {
            folder = 'uploads/images';
        }
        else if (file.mimetype.startsWith('video/')) {
            folder = 'uploads/videos';
        }
        else {
            folder = 'uploads/documents';
        }
        cb(null, folder);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// Image upload configuration
exports.imageUpload = (0, multer_1.default)({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
// Video upload configuration
exports.videoUpload = (0, multer_1.default)({
    storage,
    fileFilter: videoFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
    },
});
// General upload configuration (any file type)
exports.generalUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});
//# sourceMappingURL=upload.js.map