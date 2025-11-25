import { Request, Response, NextFunction } from 'express';
import { MessagingService } from '../services/messagingService';
import { MessageType } from '../models/Message';
import mongoose from 'mongoose';

// Conversation Controllers

export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { participants, isGroup, groupName, groupAvatar } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const participantIds = participants.map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );

    // Ensure current user is in participants
    if (!participantIds.some(id => id.toString() === userId.toString())) {
      participantIds.push(userId);
    }

    const groupData = isGroup
      ? {
          groupName,
          groupAvatar,
          groupAdmin: userId
        }
      : undefined;

    const conversation = await MessagingService.createOrGetConversation(
      participantIds,
      isGroup,
      groupData
    );

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const conversation = await MessagingService.getConversationById(conversationId);

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const includeArchived = req.query.includeArchived === 'true';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await MessagingService.getUserConversations(userId, {
      includeArchived,
      page,
      limit
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const addParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const adminId = new mongoose.Types.ObjectId(req.user!.userId);
    const { participantId } = req.body;

    const conversation = await MessagingService.addParticipant(
      conversationId,
      adminId,
      new mongoose.Types.ObjectId(participantId)
    );

    res.json({
      success: true,
      message: 'Participant added successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const removeParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const adminId = new mongoose.Types.ObjectId(req.user!.userId);
    const { participantId } = req.body;

    const conversation = await MessagingService.removeParticipant(
      conversationId,
      adminId,
      new mongoose.Types.ObjectId(participantId)
    );

    res.json({
      success: true,
      message: 'Participant removed successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const leaveConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await MessagingService.leaveConversation(conversationId, userId);

    res.json({
      success: true,
      message: 'Left conversation successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroupInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const adminId = new mongoose.Types.ObjectId(req.user!.userId);
    const { groupName, groupAvatar } = req.body;

    const conversation = await MessagingService.updateGroupInfo(
      conversationId,
      adminId,
      { groupName, groupAvatar }
    );

    res.json({
      success: true,
      message: 'Group info updated successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const toggleMute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const conversation = await MessagingService.toggleMute(conversationId, userId);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const toggleArchive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const conversation = await MessagingService.toggleArchive(conversationId, userId);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await MessagingService.deleteConversation(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Message Controllers

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
    const senderId = new mongoose.Types.ObjectId(req.user!.userId);

    const message = await MessagingService.sendMessage(conversationId, senderId, req.body);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
    const before = req.query.before ? new Date(req.query.before as string) : undefined;
    const after = req.query.after ? new Date(req.query.after as string) : undefined;
    const limit = Number(req.query.limit) || 50;

    const messages = await MessagingService.getMessages(conversationId, {
      before,
      after,
      limit
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const conversation = await MessagingService.markAsRead(conversationId, userId);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { content } = req.body;

    const message = await MessagingService.editMessage(messageId, userId, content);

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await MessagingService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addReaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { emoji } = req.body;

    const message = await MessagingService.addReaction(messageId, userId, emoji);

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const count = await MessagingService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};

export const searchMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const searchQuery = req.query.q as string;
    const limit = Number(req.query.limit) || 20;

    if (!searchQuery) {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    const messages = await MessagingService.searchMessages(userId, searchQuery, limit);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};
