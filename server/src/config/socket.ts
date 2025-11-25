import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

let io: Server | null = null;

export const initSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET as string
      ) as SocketUser;

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.user?.name} (${socket.id})`);

    // Join user's personal room
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
    }

    // Join course room
    socket.on('join:course', (courseId: string) => {
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
    socket.on('leave:course', (courseId: string) => {
      socket.leave(`course:${courseId}`);
      console.log(`User ${socket.user?.name} left course ${courseId}`);

      socket.to(`course:${courseId}`).emit('user:left', {
        userId: socket.user?.id,
        userName: socket.user?.name,
        timestamp: new Date(),
      });
    });

    // Send message in course chat
    socket.on('message:send', async (data: {
      courseId: string;
      message: string;
      type?: 'text' | 'question';
    }) => {
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
    socket.on('typing:start', (courseId: string) => {
      socket.to(`course:${courseId}`).emit('user:typing', {
        userId: socket.user?.id,
        userName: socket.user?.name,
      });
    });

    socket.on('typing:stop', (courseId: string) => {
      socket.to(`course:${courseId}`).emit('user:stopped-typing', {
        userId: socket.user?.id,
      });
    });

    // Video progress sync (for study groups)
    socket.on('video:progress', (data: {
      courseId: string;
      lessonId: string;
      currentTime: number;
    }) => {
      socket.to(`course:${data.courseId}`).emit('video:progress-update', {
        userId: socket.user?.id,
        ...data,
      });
    });

    // Q&A real-time updates
    socket.on('question:ask', (data: {
      courseId: string;
      question: string;
      lessonId?: string;
    }) => {
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

    socket.on('question:answer', (data: {
      courseId: string;
      questionId: string;
      answer: string;
    }) => {
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

export const getIO = (): Server | null => {
  return io;
};

// Utility functions for emitting events from controllers
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToCourse = (courseId: string, event: string, data: any) => {
  if (io) {
    io.to(`course:${courseId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
