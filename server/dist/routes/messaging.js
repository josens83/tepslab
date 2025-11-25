"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messagingController = __importStar(require("../controllers/messagingController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Conversation Routes
/**
 * @route   POST /api/messaging/conversations
 * @desc    Create or get a conversation
 * @access  Private
 */
router.post('/conversations', auth_1.auth, messagingController.createConversation);
/**
 * @route   GET /api/messaging/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', auth_1.auth, messagingController.getUserConversations);
/**
 * @route   GET /api/messaging/conversations/:id
 * @desc    Get conversation by ID
 * @access  Private
 */
router.get('/conversations/:id', auth_1.auth, messagingController.getConversation);
/**
 * @route   POST /api/messaging/conversations/:id/participants
 * @desc    Add participant to group conversation
 * @access  Private (Group Admin)
 */
router.post('/conversations/:id/participants', auth_1.auth, messagingController.addParticipant);
/**
 * @route   DELETE /api/messaging/conversations/:id/participants
 * @desc    Remove participant from group conversation
 * @access  Private (Group Admin)
 */
router.delete('/conversations/:id/participants', auth_1.auth, messagingController.removeParticipant);
/**
 * @route   POST /api/messaging/conversations/:id/leave
 * @desc    Leave a group conversation
 * @access  Private
 */
router.post('/conversations/:id/leave', auth_1.auth, messagingController.leaveConversation);
/**
 * @route   PUT /api/messaging/conversations/:id/group-info
 * @desc    Update group conversation info
 * @access  Private (Group Admin)
 */
router.put('/conversations/:id/group-info', auth_1.auth, messagingController.updateGroupInfo);
/**
 * @route   POST /api/messaging/conversations/:id/mute
 * @desc    Toggle mute notifications
 * @access  Private
 */
router.post('/conversations/:id/mute', auth_1.auth, messagingController.toggleMute);
/**
 * @route   POST /api/messaging/conversations/:id/archive
 * @desc    Toggle archive conversation
 * @access  Private
 */
router.post('/conversations/:id/archive', auth_1.auth, messagingController.toggleArchive);
/**
 * @route   DELETE /api/messaging/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversations/:id', auth_1.auth, messagingController.deleteConversation);
// Message Routes
/**
 * @route   POST /api/messaging/conversations/:conversationId/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', auth_1.auth, messagingController.sendMessage);
/**
 * @route   GET /api/messaging/conversations/:conversationId/messages
 * @desc    Get messages in a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', auth_1.auth, messagingController.getMessages);
/**
 * @route   POST /api/messaging/conversations/:conversationId/read
 * @desc    Mark conversation as read
 * @access  Private
 */
router.post('/conversations/:conversationId/read', auth_1.auth, messagingController.markAsRead);
/**
 * @route   PUT /api/messaging/messages/:id
 * @desc    Edit a message
 * @access  Private (Sender)
 */
router.put('/messages/:id', auth_1.auth, messagingController.editMessage);
/**
 * @route   DELETE /api/messaging/messages/:id
 * @desc    Delete a message
 * @access  Private (Sender)
 */
router.delete('/messages/:id', auth_1.auth, messagingController.deleteMessage);
/**
 * @route   POST /api/messaging/messages/:id/reaction
 * @desc    Add reaction to a message
 * @access  Private
 */
router.post('/messages/:id/reaction', auth_1.auth, messagingController.addReaction);
// Utility Routes
/**
 * @route   GET /api/messaging/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', auth_1.auth, messagingController.getUnreadCount);
/**
 * @route   GET /api/messaging/search
 * @desc    Search messages
 * @access  Private
 */
router.get('/search', auth_1.auth, messagingController.searchMessages);
exports.default = router;
//# sourceMappingURL=messaging.js.map