"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedGroups = exports.getGroupStats = exports.completeSession = exports.attendSession = exports.scheduleSession = exports.updateMemberRole = exports.deleteGroup = exports.updateGroup = exports.leaveGroup = exports.joinGroup = exports.getUserGroups = exports.getGroups = exports.getGroup = exports.createGroup = void 0;
const studyGroupService_1 = require("../services/studyGroupService");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Create study group
 */
const createGroup = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const group = await studyGroupService_1.StudyGroupService.createGroup(userId, req.body);
        res.status(201).json({
            success: true,
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createGroup = createGroup;
/**
 * Get group by ID
 */
const getGroup = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const group = await studyGroupService_1.StudyGroupService.getGroupById(groupId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getGroup = getGroup;
/**
 * Get all groups with filters
 */
const getGroups = async (req, res, next) => {
    try {
        const { groupType, status, targetScore, tags, search, page, limit } = req.query;
        const filters = {};
        if (groupType)
            filters.groupType = groupType;
        if (status)
            filters.status = status;
        if (targetScore)
            filters.targetScore = Number(targetScore);
        if (tags)
            filters.tags = tags.split(',');
        if (search)
            filters.search = search;
        if (page)
            filters.page = Number(page);
        if (limit)
            filters.limit = Number(limit);
        const result = await studyGroupService_1.StudyGroupService.getGroups(filters);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getGroups = getGroups;
/**
 * Get user's groups
 */
const getUserGroups = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const groups = await studyGroupService_1.StudyGroupService.getUserGroups(userId);
        res.json({
            success: true,
            data: groups
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserGroups = getUserGroups;
/**
 * Join group
 */
const joinGroup = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const group = await studyGroupService_1.StudyGroupService.joinGroup(groupId, userId);
        res.json({
            success: true,
            message: 'Successfully joined the group',
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.joinGroup = joinGroup;
/**
 * Leave group
 */
const leaveGroup = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await studyGroupService_1.StudyGroupService.leaveGroup(groupId, userId);
        res.json({
            success: true,
            message: 'Successfully left the group'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.leaveGroup = leaveGroup;
/**
 * Update group
 */
const updateGroup = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const group = await studyGroupService_1.StudyGroupService.updateGroup(groupId, userId, req.body);
        res.json({
            success: true,
            message: 'Group updated successfully',
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateGroup = updateGroup;
/**
 * Delete group
 */
const deleteGroup = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await studyGroupService_1.StudyGroupService.deleteGroup(groupId, userId);
        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteGroup = deleteGroup;
/**
 * Update member role
 */
const updateMemberRole = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const adminId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { memberId, role } = req.body;
        const group = await studyGroupService_1.StudyGroupService.updateMemberRole(groupId, adminId, new mongoose_1.default.Types.ObjectId(memberId), role);
        res.json({
            success: true,
            message: 'Member role updated successfully',
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMemberRole = updateMemberRole;
/**
 * Schedule study session
 */
const scheduleSession = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const group = await studyGroupService_1.StudyGroupService.scheduleSession(groupId, userId, req.body);
        res.json({
            success: true,
            message: 'Study session scheduled successfully',
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.scheduleSession = scheduleSession;
/**
 * Attend study session
 */
const attendSession = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const sessionIndex = Number(req.params.sessionIndex);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const group = await studyGroupService_1.StudyGroupService.attendSession(groupId, sessionIndex, userId);
        res.json({
            success: true,
            message: 'Attendance confirmed',
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.attendSession = attendSession;
/**
 * Complete study session
 */
const completeSession = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const sessionIndex = Number(req.params.sessionIndex);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { notes } = req.body;
        const group = await studyGroupService_1.StudyGroupService.completeSession(groupId, sessionIndex, userId, notes);
        res.json({
            success: true,
            message: 'Study session completed',
            data: group
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeSession = completeSession;
/**
 * Get group statistics
 */
const getGroupStats = async (req, res, next) => {
    try {
        const groupId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const stats = await studyGroupService_1.StudyGroupService.getGroupStats(groupId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getGroupStats = getGroupStats;
/**
 * Get recommended groups
 */
const getRecommendedGroups = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { targetScore, limit } = req.query;
        const groups = await studyGroupService_1.StudyGroupService.getRecommendedGroups(userId, Number(targetScore) || 500, Number(limit) || 5);
        res.json({
            success: true,
            data: groups
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecommendedGroups = getRecommendedGroups;
//# sourceMappingURL=studyGroupController.js.map