"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMessages = exports.getUnreadCount = exports.addReaction = exports.deleteMessage = exports.editMessage = exports.markAsRead = exports.getMessages = exports.sendMessage = exports.deleteConversation = exports.toggleArchive = exports.toggleMute = exports.updateGroupInfo = exports.leaveConversation = exports.removeParticipant = exports.addParticipant = exports.getUserConversations = exports.getConversation = exports.createConversation = void 0;
const messagingService_1 = require("../services/messagingService");
const mongoose_1 = __importDefault(require("mongoose"));
// Conversation Controllers
const createConversation = async (req, res, next) => {
    try {
        const { participants, isGroup, groupName, groupAvatar } = req.body;
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const participantIds = participants.map((id) => new mongoose_1.default.Types.ObjectId(id));
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
        const conversation = await messagingService_1.MessagingService.createOrGetConversation(participantIds, isGroup, groupData);
        res.status(201).json({
            success: true,
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createConversation = createConversation;
const getConversation = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const conversation = await messagingService_1.MessagingService.getConversationById(conversationId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getConversation = getConversation;
const getUserConversations = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const includeArchived = req.query.includeArchived === 'true';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await messagingService_1.MessagingService.getUserConversations(userId, {
            includeArchived,
            page,
            limit
        });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserConversations = getUserConversations;
const addParticipant = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const adminId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { participantId } = req.body;
        const conversation = await messagingService_1.MessagingService.addParticipant(conversationId, adminId, new mongoose_1.default.Types.ObjectId(participantId));
        res.json({
            success: true,
            message: 'Participant added successfully',
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addParticipant = addParticipant;
const removeParticipant = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const adminId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { participantId } = req.body;
        const conversation = await messagingService_1.MessagingService.removeParticipant(conversationId, adminId, new mongoose_1.default.Types.ObjectId(participantId));
        res.json({
            success: true,
            message: 'Participant removed successfully',
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeParticipant = removeParticipant;
const leaveConversation = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await messagingService_1.MessagingService.leaveConversation(conversationId, userId);
        res.json({
            success: true,
            message: 'Left conversation successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.leaveConversation = leaveConversation;
const updateGroupInfo = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const adminId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { groupName, groupAvatar } = req.body;
        const conversation = await messagingService_1.MessagingService.updateGroupInfo(conversationId, adminId, { groupName, groupAvatar });
        res.json({
            success: true,
            message: 'Group info updated successfully',
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateGroupInfo = updateGroupInfo;
const toggleMute = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const conversation = await messagingService_1.MessagingService.toggleMute(conversationId, userId);
        res.json({
            success: true,
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleMute = toggleMute;
const toggleArchive = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const conversation = await messagingService_1.MessagingService.toggleArchive(conversationId, userId);
        res.json({
            success: true,
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleArchive = toggleArchive;
const deleteConversation = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await messagingService_1.MessagingService.deleteConversation(conversationId, userId);
        res.json({
            success: true,
            message: 'Conversation deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteConversation = deleteConversation;
// Message Controllers
const sendMessage = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.conversationId);
        const senderId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const message = await messagingService_1.MessagingService.sendMessage(conversationId, senderId, req.body);
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.conversationId);
        const before = req.query.before ? new Date(req.query.before) : undefined;
        const after = req.query.after ? new Date(req.query.after) : undefined;
        const limit = Number(req.query.limit) || 50;
        const messages = await messagingService_1.MessagingService.getMessages(conversationId, {
            before,
            after,
            limit
        });
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMessages = getMessages;
const markAsRead = async (req, res, next) => {
    try {
        const conversationId = new mongoose_1.default.Types.ObjectId(req.params.conversationId);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const conversation = await messagingService_1.MessagingService.markAsRead(conversationId, userId);
        res.json({
            success: true,
            data: conversation
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const editMessage = async (req, res, next) => {
    try {
        const messageId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { content } = req.body;
        const message = await messagingService_1.MessagingService.editMessage(messageId, userId, content);
        res.json({
            success: true,
            message: 'Message updated successfully',
            data: message
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editMessage = editMessage;
const deleteMessage = async (req, res, next) => {
    try {
        const messageId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await messagingService_1.MessagingService.deleteMessage(messageId, userId);
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMessage = deleteMessage;
const addReaction = async (req, res, next) => {
    try {
        const messageId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { emoji } = req.body;
        const message = await messagingService_1.MessagingService.addReaction(messageId, userId, emoji);
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addReaction = addReaction;
const getUnreadCount = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const count = await messagingService_1.MessagingService.getUnreadCount(userId);
        res.json({
            success: true,
            data: { unreadCount: count }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadCount = getUnreadCount;
const searchMessages = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const searchQuery = req.query.q;
        const limit = Number(req.query.limit) || 20;
        if (!searchQuery) {
            res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
            return;
        }
        const messages = await messagingService_1.MessagingService.searchMessages(userId, searchQuery, limit);
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchMessages = searchMessages;
//# sourceMappingURL=messagingController.js.map