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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Conversation = exports.MessageType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Message Types
 */
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["FILE"] = "file";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
/**
 * Conversation Schema
 */
const conversationSchema = new mongoose_1.Schema({
    participants: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        content: {
            type: String,
            maxlength: 500
        },
        senderId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date
    },
    readStatus: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            }],
        archived: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            }]
    }
}, {
    timestamps: true
});
/**
 * Message Schema
 */
const messageSchema = new mongoose_1.Schema({
    conversationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }],
    replyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
// Indexes for Conversation
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ updatedAt: -1 });
// Indexes for Message
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });
// Method: Update last message
conversationSchema.methods.updateLastMessage = function (content, senderId) {
    this.lastMessage = {
        content: content.substring(0, 500),
        senderId,
        timestamp: new Date()
    };
};
// Method: Mark as read for user
conversationSchema.methods.markAsRead = function (userId) {
    const status = this.readStatus.find((s) => s.userId.toString() === userId.toString());
    if (status) {
        status.lastReadAt = new Date();
        status.unreadCount = 0;
    }
    else {
        this.readStatus.push({
            userId,
            lastReadAt: new Date(),
            unreadCount: 0
        });
    }
};
// Method: Increment unread for other participants
conversationSchema.methods.incrementUnread = function (senderId) {
    this.participants.forEach((participantId) => {
        if (participantId.toString() !== senderId.toString()) {
            const status = this.readStatus.find((s) => s.userId.toString() === participantId.toString());
            if (status) {
                status.unreadCount += 1;
            }
            else {
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
conversationSchema.methods.addParticipant = function (userId) {
    if (!this.isGroup) {
        throw new Error('Cannot add participant to non-group conversation');
    }
    const exists = this.participants.some((id) => id.toString() === userId.toString());
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
conversationSchema.methods.removeParticipant = function (userId) {
    if (!this.isGroup) {
        throw new Error('Cannot remove participant from non-group conversation');
    }
    const index = this.participants.findIndex((id) => id.toString() === userId.toString());
    if (index > -1) {
        this.participants.splice(index, 1);
        const statusIndex = this.readStatus.findIndex((s) => s.userId.toString() === userId.toString());
        if (statusIndex > -1) {
            this.readStatus.splice(statusIndex, 1);
        }
    }
};
// Method: Toggle mute for user
conversationSchema.methods.toggleMute = function (userId) {
    const index = this.settings.muteNotifications.findIndex((id) => id.toString() === userId.toString());
    if (index > -1) {
        this.settings.muteNotifications.splice(index, 1);
    }
    else {
        this.settings.muteNotifications.push(userId);
    }
};
// Method: Toggle archive for user
conversationSchema.methods.toggleArchive = function (userId) {
    const index = this.settings.archived.findIndex((id) => id.toString() === userId.toString());
    if (index > -1) {
        this.settings.archived.splice(index, 1);
    }
    else {
        this.settings.archived.push(userId);
    }
};
// Method: Mark message as read
messageSchema.methods.markAsReadBy = function (userId) {
    const exists = this.readBy.some((r) => r.userId.toString() === userId.toString());
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
messageSchema.methods.addReaction = function (emoji, userId) {
    const existing = this.reactions.find((r) => r.userId.toString() === userId.toString() && r.emoji === emoji);
    if (existing) {
        // Remove reaction if already exists
        const index = this.reactions.findIndex((r) => r.userId.toString() === userId.toString() && r.emoji === emoji);
        this.reactions.splice(index, 1);
    }
    else {
        // Add new reaction
        this.reactions.push({ emoji, userId });
    }
};
/**
 * Message Models
 */
exports.Conversation = mongoose_1.default.model('Conversation', conversationSchema);
exports.Message = mongoose_1.default.model('Message', messageSchema);
//# sourceMappingURL=Message.js.map