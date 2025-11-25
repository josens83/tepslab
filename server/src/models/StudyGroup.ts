import mongoose, { Schema, Document } from 'mongoose';

/**
 * Study Group Types
 */
export enum GroupType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only'
}

export enum GroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

/**
 * Study Group Member Interface
 */
export interface IGroupMember {
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
  lastActiveAt: Date;
  contributionScore: number; // Based on activity
}

/**
 * Study Session Interface
 */
export interface IStudySession {
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // minutes
  attendees: mongoose.Types.ObjectId[];
  completedAt?: Date;
  notes?: string;
}

/**
 * Study Group Interface
 */
export interface IStudyGroup extends Document {
  name: string;
  description: string;
  groupType: GroupType;
  status: GroupStatus;

  // Target and Goals
  targetScore: number;
  studyGoals: string[];

  // Members
  members: IGroupMember[];
  maxMembers: number;

  // Settings
  settings: {
    allowMemberInvite: boolean;
    requireApproval: boolean;
    autoAcceptInvite: boolean;
    notificationsEnabled: boolean;
  };

  // Study Sessions
  studySessions: IStudySession[];

  // Tags and Categories
  tags: string[];
  targetSections: string[]; // Grammar, Vocabulary, Listening, Reading

  // Statistics
  stats: {
    totalStudyHours: number;
    totalQuestions: number;
    averageScore: number;
    activeMembers: number;
  };

  // Metadata
  coverImage?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;

  // Methods
  addMember(userId: mongoose.Types.ObjectId, role?: string): Promise<void>;
  removeMember(userId: mongoose.Types.ObjectId): Promise<void>;
  isAdminOrOwner(userId: mongoose.Types.ObjectId): boolean;
  updateMemberRole(userId: mongoose.Types.ObjectId, role: string): Promise<void>;
  isMember(userId: mongoose.Types.ObjectId): boolean;
  scheduleSession(session: IStudySession): Promise<void>;
}

/**
 * Study Group Schema
 */
const studyGroupSchema = new Schema<IStudyGroup>(
  {
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
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    archivedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
studyGroupSchema.index({ status: 1, groupType: 1 });
studyGroupSchema.index({ createdBy: 1 });
studyGroupSchema.index({ 'members.userId': 1 });
studyGroupSchema.index({ targetScore: 1 });
studyGroupSchema.index({ tags: 1 });
studyGroupSchema.index({ createdAt: -1 });

// Virtual: member count
studyGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual: is full
studyGroupSchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

// Method: Add member
studyGroupSchema.methods.addMember = function(userId: mongoose.Types.ObjectId, role: MemberRole = MemberRole.MEMBER) {
  if (this.isFull) {
    throw new Error('Study group is full');
  }

  const existingMember = this.members.find(
    (m: IGroupMember) => m.userId.toString() === userId.toString()
  );

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
studyGroupSchema.methods.removeMember = function(userId: mongoose.Types.ObjectId) {
  const memberIndex = this.members.findIndex(
    (m: IGroupMember) => m.userId.toString() === userId.toString()
  );

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
studyGroupSchema.methods.updateMemberRole = function(
  userId: mongoose.Types.ObjectId,
  newRole: MemberRole
) {
  const member = this.members.find(
    (m: IGroupMember) => m.userId.toString() === userId.toString()
  );

  if (!member) {
    throw new Error('User is not a member');
  }

  member.role = newRole;
};

// Method: Schedule study session
studyGroupSchema.methods.scheduleSession = function(session: Omit<IStudySession, 'attendees'>) {
  this.studySessions.push({
    ...session,
    attendees: []
  });
};

// Method: Check if user is member
studyGroupSchema.methods.isMember = function(userId: mongoose.Types.ObjectId): boolean {
  return this.members.some(
    (m: IGroupMember) => m.userId.toString() === userId.toString()
  );
};

// Method: Check if user is admin or owner
studyGroupSchema.methods.isAdminOrOwner = function(userId: mongoose.Types.ObjectId): boolean {
  const member = this.members.find(
    (m: IGroupMember) => m.userId.toString() === userId.toString()
  );
  return member ? [MemberRole.OWNER, MemberRole.ADMIN].includes(member.role) : false;
};

/**
 * Study Group Model
 */
export const StudyGroup = mongoose.model<IStudyGroup>('StudyGroup', studyGroupSchema);
