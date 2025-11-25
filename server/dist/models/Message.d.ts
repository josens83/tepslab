import mongoose, { Document } from 'mongoose';
/**
 * Message Types
 */
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    SYSTEM = "system"
}
/**
 * Conversation Interface
 */
export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    groupAdmin?: mongoose.Types.ObjectId;
    lastMessage?: {
        content: string;
        senderId: mongoose.Types.ObjectId;
        timestamp: Date;
    };
    readStatus: {
        userId: mongoose.Types.ObjectId;
        lastReadAt: Date;
        unreadCount: number;
    }[];
    settings: {
        muteNotifications: mongoose.Types.ObjectId[];
        archived: mongoose.Types.ObjectId[];
    };
    createdAt: Date;
    updatedAt: Date;
    updateLastMessage(content: string, senderId: mongoose.Types.ObjectId): void;
    markAsRead(userId: mongoose.Types.ObjectId): void;
    incrementUnread(senderId: mongoose.Types.ObjectId): void;
    addParticipant(userId: mongoose.Types.ObjectId): void;
    removeParticipant(userId: mongoose.Types.ObjectId): void;
    toggleMute(userId: mongoose.Types.ObjectId): void;
    toggleArchive(userId: mongoose.Types.ObjectId): void;
}
/**
 * Message Interface
 */
export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    messageType: MessageType;
    content: string;
    attachments?: {
        type: string;
        url: string;
        filename: string;
        size: number;
    }[];
    isRead: boolean;
    readBy: {
        userId: mongoose.Types.ObjectId;
        readAt: Date;
    }[];
    reactions: {
        emoji: string;
        userId: mongoose.Types.ObjectId;
    }[];
    replyTo?: mongoose.Types.ObjectId;
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    markAsReadBy(userId: mongoose.Types.ObjectId): void;
    addReaction(emoji: string, userId: mongoose.Types.ObjectId): void;
}
/**
 * Message Models
 */
export declare const Conversation: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Message.d.ts.map