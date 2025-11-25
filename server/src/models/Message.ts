import mongoose, { Schema, Document } from 'mongoose';

/**
 * Message Types
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

/**
 * Conversation Interface
 */
export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];

  // Group conversation
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: mongoose.Types.ObjectId;

  // Last message info
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };

  // Read status per user
  readStatus: {
    userId: mongoose.Types.ObjectId;
    lastReadAt: Date;
    unreadCount: number;
  }[];

  // Settings
  settings: {
    muteNotifications: mongoose.Types.ObjectId[]; // Users who muted
    archived: mongoose.Types.ObjectId[]; // Users who archived
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Interface
 */
export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;

  // Content
  messageType: MessageType;
  content: string;

  // Attachments
  attachments?: {
    type: string; // 'image', 'file'
    url: string;
    filename: string;
    size: number;
  }[];

  // Status
  isRead: boolean;
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];

  // Reactions
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }[];

  // Reply
  replyTo?: mongoose.Types.ObjectId;

  // Metadata
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation Schema
 */
const conversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      trim: true,
      maxlength: 100
    },
    groupAvatar: String,
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    lastMessage: {
      content: {
        type: String,
        maxlength: 500
      },
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date
    },
    readStatus: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      lastReadAt: {
        type: Date,
        default: Date.now
      },
      unreadCount: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    settings: {
      muteNotifications: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      archived: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  },
  {
    timestamps: true
  }
);

/**
 * Message Schema
 */
const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messageType: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'file']
      },
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      }
    }],
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    reactions: [{
      emoji: {
        type: String,
        required: true,
        maxlength: 10
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for Conversation
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ updatedAt: -1 });

// Indexes for Message
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Method: Update last message
conversationSchema.methods.updateLastMessage = function(
  content: string,
  senderId: mongoose.Types.ObjectId
) {
  this.lastMessage = {
    content: content.substring(0, 500),
    senderId,
    timestamp: new Date()
  };
};

// Method: Mark as read for user
conversationSchema.methods.markAsRead = function(userId: mongoose.Types.ObjectId) {
  const status = this.readStatus.find(
    (s: any) => s.userId.toString() === userId.toString()
  );

  if (status) {
    status.lastReadAt = new Date();
    status.unreadCount = 0;
  } else {
    this.readStatus.push({
      userId,
      lastReadAt: new Date(),
      unreadCount: 0
    });
  }
};

// Method: Increment unread for other participants
conversationSchema.methods.incrementUnread = function(senderId: mongoose.Types.ObjectId) {
  this.participants.forEach((participantId: mongoose.Types.ObjectId) => {
    if (participantId.toString() !== senderId.toString()) {
      const status = this.readStatus.find(
        (s: any) => s.userId.toString() === participantId.toString()
      );

      if (status) {
        status.unreadCount += 1;
      } else {
        this.readStatus.push({
          userId: participantId,
          lastReadAt: new Date(0),
          unreadCount: 1
        });
      }
    }
  });
};

// Method: Add participant to group
conversationSchema.methods.addParticipant = function(userId: mongoose.Types.ObjectId) {
  if (!this.isGroup) {
    throw new Error('Cannot add participant to non-group conversation');
  }

  const exists = this.participants.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (!exists) {
    this.participants.push(userId);
    this.readStatus.push({
      userId,
      lastReadAt: new Date(),
      unreadCount: 0
    });
  }
};

// Method: Remove participant from group
conversationSchema.methods.removeParticipant = function(userId: mongoose.Types.ObjectId) {
  if (!this.isGroup) {
    throw new Error('Cannot remove participant from non-group conversation');
  }

  const index = this.participants.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (index > -1) {
    this.participants.splice(index, 1);

    const statusIndex = this.readStatus.findIndex(
      (s: any) => s.userId.toString() === userId.toString()
    );
    if (statusIndex > -1) {
      this.readStatus.splice(statusIndex, 1);
    }
  }
};

// Method: Toggle mute for user
conversationSchema.methods.toggleMute = function(userId: mongoose.Types.ObjectId) {
  const index = this.settings.muteNotifications.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (index > -1) {
    this.settings.muteNotifications.splice(index, 1);
  } else {
    this.settings.muteNotifications.push(userId);
  }
};

// Method: Toggle archive for user
conversationSchema.methods.toggleArchive = function(userId: mongoose.Types.ObjectId) {
  const index = this.settings.archived.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (index > -1) {
    this.settings.archived.splice(index, 1);
  } else {
    this.settings.archived.push(userId);
  }
};

// Method: Mark message as read
messageSchema.methods.markAsReadBy = function(userId: mongoose.Types.ObjectId) {
  const exists = this.readBy.some(
    (r: any) => r.userId.toString() === userId.toString()
  );

  if (!exists) {
    this.readBy.push({
      userId,
      readAt: new Date()
    });

    // Update isRead if all participants have read
    // This would be calculated based on conversation participants
    this.isRead = true;
  }
};

// Method: Add reaction
messageSchema.methods.addReaction = function(emoji: string, userId: mongoose.Types.ObjectId) {
  const existing = this.reactions.find(
    (r: any) => r.userId.toString() === userId.toString() && r.emoji === emoji
  );

  if (existing) {
    // Remove reaction if already exists
    const index = this.reactions.findIndex(
      (r: any) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );
    this.reactions.splice(index, 1);
  } else {
    // Add new reaction
    this.reactions.push({ emoji, userId });
  }
};

/**
 * Message Models
 */
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);
