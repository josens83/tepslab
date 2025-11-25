import express from 'express';
import * as messagingController from '../controllers/messagingController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Conversation Routes

/**
 * @route   POST /api/messaging/conversations
 * @desc    Create or get a conversation
 * @access  Private
 */
router.post('/conversations', auth, messagingController.createConversation);

/**
 * @route   GET /api/messaging/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', auth, messagingController.getUserConversations);

/**
 * @route   GET /api/messaging/conversations/:id
 * @desc    Get conversation by ID
 * @access  Private
 */
router.get('/conversations/:id', auth, messagingController.getConversation);

/**
 * @route   POST /api/messaging/conversations/:id/participants
 * @desc    Add participant to group conversation
 * @access  Private (Group Admin)
 */
router.post('/conversations/:id/participants', auth, messagingController.addParticipant);

/**
 * @route   DELETE /api/messaging/conversations/:id/participants
 * @desc    Remove participant from group conversation
 * @access  Private (Group Admin)
 */
router.delete('/conversations/:id/participants', auth, messagingController.removeParticipant);

/**
 * @route   POST /api/messaging/conversations/:id/leave
 * @desc    Leave a group conversation
 * @access  Private
 */
router.post('/conversations/:id/leave', auth, messagingController.leaveConversation);

/**
 * @route   PUT /api/messaging/conversations/:id/group-info
 * @desc    Update group conversation info
 * @access  Private (Group Admin)
 */
router.put('/conversations/:id/group-info', auth, messagingController.updateGroupInfo);

/**
 * @route   POST /api/messaging/conversations/:id/mute
 * @desc    Toggle mute notifications
 * @access  Private
 */
router.post('/conversations/:id/mute', auth, messagingController.toggleMute);

/**
 * @route   POST /api/messaging/conversations/:id/archive
 * @desc    Toggle archive conversation
 * @access  Private
 */
router.post('/conversations/:id/archive', auth, messagingController.toggleArchive);

/**
 * @route   DELETE /api/messaging/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversations/:id', auth, messagingController.deleteConversation);

// Message Routes

/**
 * @route   POST /api/messaging/conversations/:conversationId/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', auth, messagingController.sendMessage);

/**
 * @route   GET /api/messaging/conversations/:conversationId/messages
 * @desc    Get messages in a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', auth, messagingController.getMessages);

/**
 * @route   POST /api/messaging/conversations/:conversationId/read
 * @desc    Mark conversation as read
 * @access  Private
 */
router.post('/conversations/:conversationId/read', auth, messagingController.markAsRead);

/**
 * @route   PUT /api/messaging/messages/:id
 * @desc    Edit a message
 * @access  Private (Sender)
 */
router.put('/messages/:id', auth, messagingController.editMessage);

/**
 * @route   DELETE /api/messaging/messages/:id
 * @desc    Delete a message
 * @access  Private (Sender)
 */
router.delete('/messages/:id', auth, messagingController.deleteMessage);

/**
 * @route   POST /api/messaging/messages/:id/reaction
 * @desc    Add reaction to a message
 * @access  Private
 */
router.post('/messages/:id/reaction', auth, messagingController.addReaction);

// Utility Routes

/**
 * @route   GET /api/messaging/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', auth, messagingController.getUnreadCount);

/**
 * @route   GET /api/messaging/search
 * @desc    Search messages
 * @access  Private
 */
router.get('/search', auth, messagingController.searchMessages);

export default router;
