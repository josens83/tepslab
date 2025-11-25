import { IConversation, IMessage, MessageType } from '../models/Message';
import mongoose from 'mongoose';
/**
 * Messaging Service
 */
export declare class MessagingService {
    /**
     * Create or get existing conversation
     */
    static createOrGetConversation(participants: mongoose.Types.ObjectId[], isGroup?: boolean, groupData?: {
        groupName: string;
        groupAvatar?: string;
        groupAdmin: mongoose.Types.ObjectId;
    }): Promise<IConversation>;
    /**
     * Get conversation by ID
     */
    static getConversationById(conversationId: mongoose.Types.ObjectId): Promise<IConversation | null>;
    /**
     * Get user's conversations
     */
    static getUserConversations(userId: mongoose.Types.ObjectId, filters?: {
        includeArchived?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        conversations: IConversation[];
        total: number;
    }>;
    /**
     * Send message
     */
    static sendMessage(conversationId: mongoose.Types.ObjectId, senderId: mongoose.Types.ObjectId, messageData: {
        content: string;
        messageType?: MessageType;
        attachments?: {
            type: string;
            url: string;
            filename: string;
            size: number;
        }[];
        replyTo?: mongoose.Types.ObjectId;
    }): Promise<IMessage>;
    /**
     * Get messages in conversation
     */
    static getMessages(conversationId: mongoose.Types.ObjectId, filters?: {
        before?: Date;
        after?: Date;
        limit?: number;
    }): Promise<IMessage[]>;
    /**
     * Mark conversation as read
     */
    static markAsRead(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IConversation>;
    /**
     * Edit message
     */
    static editMessage(messageId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, newContent: string): Promise<IMessage>;
    /**
     * Delete message
     */
    static deleteMessage(messageId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
    /**
     * Add reaction to message
     */
    static addReaction(messageId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, emoji: string): Promise<IMessage>;
    /**
     * Add participant to group conversation
     */
    static addParticipant(conversationId: mongoose.Types.ObjectId, adminId: mongoose.Types.ObjectId, newParticipantId: mongoose.Types.ObjectId): Promise<IConversation>;
    /**
     * Remove participant from group conversation
     */
    static removeParticipant(conversationId: mongoose.Types.ObjectId, adminId: mongoose.Types.ObjectId, participantId: mongoose.Types.ObjectId): Promise<IConversation>;
    /**
     * Leave group conversation
     */
    static leaveConversation(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
    /**
     * Update group info
     */
    static updateGroupInfo(conversationId: mongoose.Types.ObjectId, adminId: mongoose.Types.ObjectId, updates: {
        groupName?: string;
        groupAvatar?: string;
    }): Promise<IConversation>;
    /**
     * Toggle mute notifications
     */
    static toggleMute(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IConversation>;
    /**
     * Toggle archive
     */
    static toggleArchive(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IConversation>;
    /**
     * Get unread count for user
     */
    static getUnreadCount(userId: mongoose.Types.ObjectId): Promise<number>;
    /**
     * Search messages
     */
    static searchMessages(userId: mongoose.Types.ObjectId, searchQuery: string, limit?: number): Promise<IMessage[]>;
    /**
     * Delete conversation (for user)
     */
    static deleteConversation(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
}
//# sourceMappingURL=messagingService.d.ts.map