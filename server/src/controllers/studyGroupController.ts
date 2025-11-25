import { Request, Response, NextFunction } from 'express';
import { StudyGroupService } from '../services/studyGroupService';
import { GroupType, MemberRole } from '../models/StudyGroup';
import mongoose from 'mongoose';

/**
 * Create study group
 */
export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const group = await StudyGroupService.createGroup(userId, req.body);

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get group by ID
 */
export const getGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const group = await StudyGroupService.getGroupById(groupId);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
      return;
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all groups with filters
 */
export const getGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      groupType,
      status,
      targetScore,
      tags,
      search,
      page,
      limit
    } = req.query;

    const filters: any = {};
    if (groupType) filters.groupType = groupType as GroupType;
    if (status) filters.status = status;
    if (targetScore) filters.targetScore = Number(targetScore);
    if (tags) filters.tags = (tags as string).split(',');
    if (search) filters.search = search as string;
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);

    const result = await StudyGroupService.getGroups(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's groups
 */
export const getUserGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const groups = await StudyGroupService.getUserGroups(userId);

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join group
 */
export const joinGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const group = await StudyGroupService.joinGroup(groupId, userId);

    res.json({
      success: true,
      message: 'Successfully joined the group',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave group
 */
export const leaveGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await StudyGroupService.leaveGroup(groupId, userId);

    res.json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update group
 */
export const updateGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const group = await StudyGroupService.updateGroup(groupId, userId, req.body);

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete group
 */
export const deleteGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    await StudyGroupService.deleteGroup(groupId, userId);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const adminId = new mongoose.Types.ObjectId(req.user!.userId);
    const { memberId, role } = req.body;

    const group = await StudyGroupService.updateMemberRole(
      groupId,
      adminId,
      new mongoose.Types.ObjectId(memberId),
      role as MemberRole
    );

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule study session
 */
export const scheduleSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const group = await StudyGroupService.scheduleSession(
      groupId,
      userId,
      req.body
    );

    res.json({
      success: true,
      message: 'Study session scheduled successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Attend study session
 */
export const attendSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const sessionIndex = Number(req.params.sessionIndex);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const group = await StudyGroupService.attendSession(
      groupId,
      sessionIndex,
      userId
    );

    res.json({
      success: true,
      message: 'Attendance confirmed',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete study session
 */
export const completeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const sessionIndex = Number(req.params.sessionIndex);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { notes } = req.body;

    const group = await StudyGroupService.completeSession(
      groupId,
      sessionIndex,
      userId,
      notes
    );

    res.json({
      success: true,
      message: 'Study session completed',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get group statistics
 */
export const getGroupStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const stats = await StudyGroupService.getGroupStats(groupId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recommended groups
 */
export const getRecommendedGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { targetScore, limit } = req.query;

    const groups = await StudyGroupService.getRecommendedGroups(
      userId,
      Number(targetScore) || 500,
      Number(limit) || 5
    );

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};
