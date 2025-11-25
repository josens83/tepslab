import { Request, Response, NextFunction } from 'express';
import { PartnerMatchingService } from '../services/partnerMatchingService';
import { PartnershipStatus } from '../models/LearningPartnership';
import mongoose from 'mongoose';

// Partner Request Controllers

export const createPartnerRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const request = await PartnerMatchingService.createPartnerRequest(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Partner request created successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnerRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestId = new mongoose.Types.ObjectId(req.params.id);
    const request = await PartnerMatchingService.getRequestById(requestId);

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Partner request not found'
      });
      return;
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const requests = await PartnerMatchingService.getUserRequests(userId);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

export const updatePartnerRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const request = await PartnerMatchingService.updatePartnerRequest(
      requestId,
      userId,
      req.body
    );

    res.json({
      success: true,
      message: 'Partner request updated successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await PartnerMatchingService.deactivateRequest(requestId, userId);

    res.json({
      success: true,
      message: 'Partner request deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const findMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const limit = Number(req.query.limit) || 10;

    const matches = await PartnerMatchingService.findMatches(userId, limit);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// Partnership Controllers

export const sendPartnershipRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requesterId = new mongoose.Types.ObjectId(req.user!.userId);
    const { targetUserId } = req.body;

    const partnership = await PartnerMatchingService.sendPartnershipRequest(
      requesterId,
      new mongoose.Types.ObjectId(targetUserId)
    );

    res.status(201).json({
      success: true,
      message: 'Partnership request sent successfully',
      data: partnership
    });
  } catch (error) {
    next(error);
  }
};

export const acceptPartnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const partnership = await PartnerMatchingService.acceptPartnership(
      partnershipId,
      userId
    );

    res.json({
      success: true,
      message: 'Partnership accepted successfully',
      data: partnership
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPartnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await PartnerMatchingService.cancelPartnership(partnershipId, userId);

    res.json({
      success: true,
      message: 'Partnership cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const completePartnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const partnership = await PartnerMatchingService.completePartnership(
      partnershipId,
      userId
    );

    res.json({
      success: true,
      message: 'Partnership completed successfully',
      data: partnership
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPartnerships = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const status = req.query.status as PartnershipStatus | undefined;

    const partnerships = await PartnerMatchingService.getUserPartnerships(
      userId,
      status
    );

    res.json({
      success: true,
      data: partnerships
    });
  } catch (error) {
    next(error);
  }
};

export const addStudySession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const partnership = await PartnerMatchingService.addStudySession(
      partnershipId,
      userId,
      req.body
    );

    res.json({
      success: true,
      message: 'Study session added successfully',
      data: partnership
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const partnership = await PartnerMatchingService.updateProgress(
      partnershipId,
      userId,
      req.body
    );

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: partnership
    });
  } catch (error) {
    next(error);
  }
};

export const addFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { rating, comment } = req.body;

    const partnership = await PartnerMatchingService.addFeedback(
      partnershipId,
      userId,
      rating,
      comment
    );

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: partnership
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnershipStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partnershipId = new mongoose.Types.ObjectId(req.params.id);
    const stats = await PartnerMatchingService.getPartnershipStats(partnershipId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
