import { Request, Response, NextFunction } from 'express';
import { AdvancedAIService } from '../services/advancedAIService';
import {  WritingType, SpeakingTaskType, ConversationType } from '../models/AdvancedAI';
import mongoose from 'mongoose';

// Writing Assessment Controllers

export const submitWriting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const submission = await AdvancedAIService.submitWriting(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Writing submitted for assessment',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

export const getWritingSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const limit = Number(req.query.limit) || 20;

    const submissions = await AdvancedAIService.getUserWritingSubmissions(userId, limit);

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

export const getWritingSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const submissionId = new mongoose.Types.ObjectId(req.params.id);
    const submission = await AdvancedAIService.getWritingSubmission(submissionId);

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
      return;
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// Speaking Practice Controllers

export const submitSpeaking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const practice = await AdvancedAIService.submitSpeaking(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Speaking practice submitted for assessment',
      data: practice
    });
  } catch (error) {
    next(error);
  }
};

export const getSpeakingPractices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const limit = Number(req.query.limit) || 20;

    const practices = await AdvancedAIService.getUserSpeakingPractices(userId, limit);

    res.json({
      success: true,
      data: practices
    });
  } catch (error) {
    next(error);
  }
};

// AI Conversation Controllers

export const startConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const conversation = await AdvancedAIService.startConversation(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Conversation started',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { message } = req.body;

    const conversation = await AdvancedAIService.sendMessage(
      conversationId,
      userId,
      message
    );

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const endConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const conversation = await AdvancedAIService.endConversation(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation ended',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const activeOnly = req.query.activeOnly === 'true';

    const conversations = await AdvancedAIService.getUserConversations(userId, activeOnly);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

export const rateConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversationId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { rating, feedback } = req.body;

    const conversation = await AdvancedAIService.rateConversation(
      conversationId,
      userId,
      rating,
      feedback
    );

    res.json({
      success: true,
      message: 'Rating submitted',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};
