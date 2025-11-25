import {
  Conversation,
  Message,
  IConversation,
  IMessage,
  MessageType
} from '../models/Message';
import mongoose from 'mongoose';

/**
 * Messaging Service
 */
export class MessagingService {
  /**
   * Create or get existing conversation
   */
  static async createOrGetConversation(
    participants: mongoose.Types.ObjectId[],
    isGroup: boolean = false,
    groupData?: {
      groupName: string;
      groupAvatar?: string;
      groupAdmin: mongoose.Types.ObjectId;
    }
  ): Promise<IConversation> {
    // For 1-on-1 conversations, check if already exists
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants }
      });

      if (existing) {
        return existing;
      }
    }

    // Create new conversation
    const conversation = new Conversation({
      participants,
      isGroup,
      ...groupData,
      readStatus: participants.map(userId => ({
        userId,
        lastReadAt: new Date(),
        unreadCount: 0
      })),
      settings: {
        muteNotifications: [],
        archived: []
      }
    });

    await conversation.save();
    return conversation.populate('participants', 'name avatar email');
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(
    conversationId: mongoose.Types.ObjectId
  ): Promise<IConversation | null> {
    return Conversation.findById(conversationId)
      .populate('participants', 'name avatar email online lastSeen')
      .populate('groupAdmin', 'name avatar');
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(
    userId: mongoose.Types.ObjectId,
    filters?: {
      includeArchived?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<{ conversations: IConversation[]; total: number }> {
    const { includeArchived = false, page = 1, limit = 50 } = filters || {};

    const query: any = {
      participants: userId
    };

    if (!includeArchived) {
      query['settings.archived'] = { $ne: userId };
    }

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('participants', 'name avatar email online lastSeen')
        .populate('groupAdmin', 'name avatar')
        .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments(query)
    ]);

    return { conversations, total };
  }

  /**
   * Send message
   */
  static async sendMessage(
    conversationId: mongoose.Types.ObjectId,
    senderId: mongoose.Types.ObjectId,
    messageData: {
      content: string;
      messageType?: MessageType;
      attachments?: {
        type: string;
        url: string;
        filename: string;
        size: number;
      }[];
      replyTo?: mongoose.Types.ObjectId;
    }
  ): Promise<IMessage> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if sender is participant
    const isParticipant = conversation.participants.some(
      (id: mongoose.Types.ObjectId) => id.toString() === senderId.toString()
    );

    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: senderId,
      messageType: messageData.messageType || MessageType.TEXT,
      content: messageData.content,
      attachments: messageData.attachments,
      replyTo: messageData.replyTo,
      isRead: false,
      readBy: [{ userId: senderId, readAt: new Date() }],
      reactions: [],
      isEdited: false,
      isDeleted: false
    });

    await message.save();

    // Update conversation
    conversation.updateLastMessage(messageData.content, senderId);
    conversation.incrementUnread(senderId);
    await conversation.save();

    return message.populate('sender', 'name avatar');
  }

  /**
   * Get messages in conversation
   */
  static async getMessages(
    conversationId: mongoose.Types.ObjectId,
    filters?: {
      before?: Date;
      after?: Date;
      limit?: number;
    }
  ): Promise<IMessage[]> {
    const { before, after, limit = 50 } = filters || {};

    const query: any = {
      conversationId,
      isDeleted: false
    };

    if (before) {
      query.createdAt = { $lt: before };
    }

    if (after) {
      query.createdAt = { ...query.createdAt, $gt: after };
    }

    return Message.find(query)
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Mark conversation as read
   */
  static async markAsRead(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.markAsRead(userId);
    await conversation.save();

    // Mark individual messages as read
    const unreadMessages = await Message.find({
      conversationId,
      sender: { $ne: userId },
      'readBy.userId': { $ne: userId }
    });

    await Promise.all(
      unreadMessages.map(async (message) => {
        message.markAsReadBy(userId);
        await message.save();
      })
    );

    return conversation;
  }

  /**
   * Edit message
   */
  static async editMessage(
    messageId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    newContent: string
  ): Promise<IMessage> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw new Error('Only the sender can edit this message');
    }

    if (message.isDeleted) {
      throw new Error('Cannot edit deleted message');
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return message;
  }

  /**
   * Delete message
   */
  static async deleteMessage(
    messageId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw new Error('Only the sender can delete this message');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message has been deleted';
    await message.save();
  }

  /**
   * Add reaction to message
   */
  static async addReaction(
    messageId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    emoji: string
  ): Promise<IMessage> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    message.addReaction(emoji, userId);
    await message.save();

    return message;
  }

  /**
   * Add participant to group conversation
   */
  static async addParticipant(
    conversationId: mongoose.Types.ObjectId,
    adminId: mongoose.Types.ObjectId,
    newParticipantId: mongoose.Types.ObjectId
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('Can only add participants to group conversations');
    }

    if (conversation.groupAdmin?.toString() !== adminId.toString()) {
      throw new Error('Only the group admin can add participants');
    }

    conversation.addParticipant(newParticipantId);
    await conversation.save();

    // Send system message
    await this.sendMessage(conversationId, adminId, {
      content: `User added to the group`,
      messageType: MessageType.SYSTEM
    });

    return conversation.populate('participants', 'name avatar');
  }

  /**
   * Remove participant from group conversation
   */
  static async removeParticipant(
    conversationId: mongoose.Types.ObjectId,
    adminId: mongoose.Types.ObjectId,
    participantId: mongoose.Types.ObjectId
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('Can only remove participants from group conversations');
    }

    if (conversation.groupAdmin?.toString() !== adminId.toString()) {
      throw new Error('Only the group admin can remove participants');
    }

    conversation.removeParticipant(participantId);
    await conversation.save();

    // Send system message
    await this.sendMessage(conversationId, adminId, {
      content: `User removed from the group`,
      messageType: MessageType.SYSTEM
    });

    return conversation.populate('participants', 'name avatar');
  }

  /**
   * Leave group conversation
   */
  static async leaveConversation(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('Can only leave group conversations');
    }

    // If admin is leaving, transfer admin to another participant
    if (conversation.groupAdmin?.toString() === userId.toString()) {
      const otherParticipants = conversation.participants.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== userId.toString()
      );

      if (otherParticipants.length > 0) {
        conversation.groupAdmin = otherParticipants[0];
      }
    }

    conversation.removeParticipant(userId);
    await conversation.save();

    // Send system message
    const systemUser = conversation.participants[0]; // Use first participant as sender
    await this.sendMessage(conversationId, systemUser, {
      content: `User left the group`,
      messageType: MessageType.SYSTEM
    });
  }

  /**
   * Update group info
   */
  static async updateGroupInfo(
    conversationId: mongoose.Types.ObjectId,
    adminId: mongoose.Types.ObjectId,
    updates: {
      groupName?: string;
      groupAvatar?: string;
    }
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('Can only update group conversations');
    }

    if (conversation.groupAdmin?.toString() !== adminId.toString()) {
      throw new Error('Only the group admin can update group info');
    }

    if (updates.groupName) {
      conversation.groupName = updates.groupName;
    }
    if (updates.groupAvatar) {
      conversation.groupAvatar = updates.groupAvatar;
    }

    await conversation.save();
    return conversation;
  }

  /**
   * Toggle mute notifications
   */
  static async toggleMute(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.toggleMute(userId);
    await conversation.save();

    return conversation;
  }

  /**
   * Toggle archive
   */
  static async toggleArchive(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.toggleArchive(userId);
    await conversation.save();

    return conversation;
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: mongoose.Types.ObjectId): Promise<number> {
    const conversations = await Conversation.find({
      participants: userId,
      'settings.archived': { $ne: userId }
    });

    let totalUnread = 0;
    conversations.forEach((conv: IConversation) => {
      const status = conv.readStatus.find(
        (s: any) => s.userId.toString() === userId.toString()
      );
      if (status) {
        totalUnread += status.unreadCount;
      }
    });

    return totalUnread;
  }

  /**
   * Search messages
   */
  static async searchMessages(
    userId: mongoose.Types.ObjectId,
    searchQuery: string,
    limit: number = 20
  ): Promise<IMessage[]> {
    // Get user's conversations
    const conversations = await Conversation.find({
      participants: userId
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    return Message.find({
      conversationId: { $in: conversationIds },
      content: { $regex: searchQuery, $options: 'i' },
      isDeleted: false
    })
      .populate('sender', 'name avatar')
      .populate('conversationId')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Delete conversation (for user)
   */
  static async deleteConversation(
    conversationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // For 1-on-1: just archive it
    if (!conversation.isGroup) {
      conversation.toggleArchive(userId);
      await conversation.save();
      return;
    }

    // For groups: remove participant
    conversation.removeParticipant(userId);
    await conversation.save();

    // If no participants left, delete conversation and messages
    if (conversation.participants.length === 0) {
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
    }
  }
}
