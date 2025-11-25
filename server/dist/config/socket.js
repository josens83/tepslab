"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToAll = exports.emitToCourse = exports.emitToUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
        pingTimeout: 60000,
    });
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user?.name} (${socket.id})`);
        // Join user's personal room
        if (socket.user) {
            socket.join(`user:${socket.user.id}`);
        }
        // Join course room
        socket.on('join:course', (courseId) => {
            socket.join(`course:${courseId}`);
            console.log(`User ${socket.user?.name} joined course ${courseId}`);
            // Notify others in the room
            socket.to(`course:${courseId}`).emit('user:joined', {
                userId: socket.user?.id,
                userName: socket.user?.name,
                timestamp: new Date(),
            });
        });
        // Leave course room
        socket.on('leave:course', (courseId) => {
            socket.leave(`course:${courseId}`);
            console.log(`User ${socket.user?.name} left course ${courseId}`);
            socket.to(`course:${courseId}`).emit('user:left', {
                userId: socket.user?.id,
                userName: socket.user?.name,
                timestamp: new Date(),
            });
        });
        // Send message in course chat
        socket.on('message:send', async (data) => {
            const { courseId, message, type = 'text' } = data;
            const messageData = {
                id: `${Date.now()}-${socket.id}`,
                courseId,
                userId: socket.user?.id,
                userName: socket.user?.name,
                message,
                type,
                timestamp: new Date(),
            };
            // Broadcast to all users in the course room
            io?.to(`course:${courseId}`).emit('message:received', messageData);
            // Save message to database (implement as needed)
            // await ChatMessage.create(messageData);
        });
        // Typing indicator
        socket.on('typing:start', (courseId) => {
            socket.to(`course:${courseId}`).emit('user:typing', {
                userId: socket.user?.id,
                userName: socket.user?.name,
            });
        });
        socket.on('typing:stop', (courseId) => {
            socket.to(`course:${courseId}`).emit('user:stopped-typing', {
                userId: socket.user?.id,
            });
        });
        // Video progress sync (for study groups)
        socket.on('video:progress', (data) => {
            socket.to(`course:${data.courseId}`).emit('video:progress-update', {
                userId: socket.user?.id,
                ...data,
            });
        });
        // Q&A real-time updates
        socket.on('question:ask', (data) => {
            const questionData = {
                id: `${Date.now()}-${socket.id}`,
                userId: socket.user?.id,
                userName: socket.user?.name,
                ...data,
                timestamp: new Date(),
                answers: [],
            };
            io?.to(`course:${data.courseId}`).emit('question:new', questionData);
        });
        socket.on('question:answer', (data) => {
            const answerData = {
                id: `${Date.now()}-${socket.id}`,
                questionId: data.questionId,
                userId: socket.user?.id,
                userName: socket.user?.name,
                answer: data.answer,
                timestamp: new Date(),
            };
            io?.to(`course:${data.courseId}`).emit('question:answered', answerData);
        });
        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user?.name} (${socket.id})`);
        });
    });
    console.log('✅ Socket.IO initialized');
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    return io;
};
exports.getIO = getIO;
// Utility functions for emitting events from controllers
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
const emitToCourse = (courseId, event, data) => {
    if (io) {
        io.to(`course:${courseId}`).emit(event, data);
    }
};
exports.emitToCourse = emitToCourse;
const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
exports.emitToAll = emitToAll;
//# sourceMappingURL=socket.js.map