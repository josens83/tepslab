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
exports.StudyGroup = exports.MemberRole = exports.GroupStatus = exports.GroupType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Study Group Types
 */
var GroupType;
(function (GroupType) {
    GroupType["PUBLIC"] = "public";
    GroupType["PRIVATE"] = "private";
    GroupType["INVITE_ONLY"] = "invite_only";
})(GroupType || (exports.GroupType = GroupType = {}));
var GroupStatus;
(function (GroupStatus) {
    GroupStatus["ACTIVE"] = "active";
    GroupStatus["INACTIVE"] = "inactive";
    GroupStatus["ARCHIVED"] = "archived";
})(GroupStatus || (exports.GroupStatus = GroupStatus = {}));
var MemberRole;
(function (MemberRole) {
    MemberRole["OWNER"] = "owner";
    MemberRole["ADMIN"] = "admin";
    MemberRole["MEMBER"] = "member";
})(MemberRole || (exports.MemberRole = MemberRole = {}));
/**
 * Study Group Schema
 */
const studyGroupSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    groupType: {
        type: String,
        enum: Object.values(GroupType),
        default: GroupType.PUBLIC
    },
    status: {
        type: String,
        enum: Object.values(GroupStatus),
        default: GroupStatus.ACTIVE
    },
    targetScore: {
        type: Number,
        required: true,
        min: 200,
        max: 990
    },
    studyGoals: [{
            type: String,
            maxlength: 200
        }],
    members: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: Object.values(MemberRole),
                default: MemberRole.MEMBER
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            lastActiveAt: {
                type: Date,
                default: Date.now
            },
            contributionScore: {
                type: Number,
                default: 0,
                min: 0
            }
        }],
    maxMembers: {
        type: Number,
        default: 50,
        min: 2,
        max: 100
    },
    settings: {
        allowMemberInvite: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        },
        autoAcceptInvite: {
            type: Boolean,
            default: true
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    },
    studySessions: [{
            title: {
                type: String,
                required: true,
                maxlength: 200
            },
            description: {
                type: String,
                maxlength: 500
            },
            scheduledAt: {
                type: Date,
                required: true
            },
            duration: {
                type: Number,
                required: true,
                min: 15,
                max: 480
            },
            attendees: [{
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'User'
                }],
            completedAt: Date,
            notes: {
                type: String,
                maxlength: 2000
            }
        }],
    tags: [{
            type: String,
            lowercase: true,
            trim: true
        }],
    targetSections: [{
            type: String,
            enum: ['grammar', 'vocabulary', 'listening', 'reading']
        }],
    stats: {
        totalStudyHours: {
            type: Number,
            default: 0,
            min: 0
        },
        totalQuestions: {
            type: Number,
            default: 0,
            min: 0
        },
        averageScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 990
        },
        activeMembers: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    coverImage: String,
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    archivedAt: Date
}, {
    timestamps: true
});
// Indexes
studyGroupSchema.index({ status: 1, groupType: 1 });
studyGroupSchema.index({ createdBy: 1 });
studyGroupSchema.index({ 'members.userId': 1 });
studyGroupSchema.index({ targetScore: 1 });
studyGroupSchema.index({ tags: 1 });
studyGroupSchema.index({ createdAt: -1 });
// Virtual: member count
studyGroupSchema.virtual('memberCount').get(function () {
    return this.members.length;
});
// Virtual: is full
studyGroupSchema.virtual('isFull').get(function () {
    return this.members.length >= this.maxMembers;
});
// Method: Add member
studyGroupSchema.methods.addMember = function (userId, role = MemberRole.MEMBER) {
    if (this.isFull) {
        throw new Error('Study group is full');
    }
    const existingMember = this.members.find((m) => m.userId.toString() === userId.toString());
    if (existingMember) {
        throw new Error('User is already a member');
    }
    this.members.push({
        userId,
        role,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        contributionScore: 0
    });
    this.stats.activeMembers = this.members.length;
};
// Method: Remove member
studyGroupSchema.methods.removeMember = function (userId) {
    const memberIndex = this.members.findIndex((m) => m.userId.toString() === userId.toString());
    if (memberIndex === -1) {
        throw new Error('User is not a member');
    }
    const member = this.members[memberIndex];
    if (member.role === MemberRole.OWNER) {
        throw new Error('Cannot remove group owner');
    }
    this.members.splice(memberIndex, 1);
    this.stats.activeMembers = this.members.length;
};
// Method: Update member role
studyGroupSchema.methods.updateMemberRole = function (userId, newRole) {
    const member = this.members.find((m) => m.userId.toString() === userId.toString());
    if (!member) {
        throw new Error('User is not a member');
    }
    member.role = newRole;
};
// Method: Schedule study session
studyGroupSchema.methods.scheduleSession = function (session) {
    this.studySessions.push({
        ...session,
        attendees: []
    });
};
// Method: Check if user is member
studyGroupSchema.methods.isMember = function (userId) {
    return this.members.some((m) => m.userId.toString() === userId.toString());
};
// Method: Check if user is admin or owner
studyGroupSchema.methods.isAdminOrOwner = function (userId) {
    const member = this.members.find((m) => m.userId.toString() === userId.toString());
    return member ? [MemberRole.OWNER, MemberRole.ADMIN].includes(member.role) : false;
};
/**
 * Study Group Model
 */
exports.StudyGroup = mongoose_1.default.model('StudyGroup', studyGroupSchema);
//# sourceMappingURL=StudyGroup.js.map