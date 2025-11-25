import mongoose, { Schema, Document } from 'mongoose';

/**
 * Partnership Status
 */
export enum PartnershipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Match Criteria Interface
 */
export interface IMatchCriteria {
  targetScore: number;
  currentScoreRange: {
    min: number;
    max: number;
  };
  targetSections: string[];
  preferredStudyTimes: string[]; // 'morning', 'afternoon', 'evening', 'night'
  studyFrequency: string; // 'daily', 'several-times-week', 'weekly'
  learningStyle: string; // 'visual', 'auditory', 'kinesthetic', 'mixed'
  goals: string[];
}

/**
 * Learning Partnership Interface
 */
export interface ILearningPartnership extends Document {
  // Partners
  partner1: mongoose.Types.ObjectId;
  partner2: mongoose.Types.ObjectId;

  // Status
  status: PartnershipStatus;
  requestedBy: mongoose.Types.ObjectId;
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;

  // Match score (compatibility)
  matchScore: number; // 0-100

  // Goals and tracking
  sharedGoals: string[];
  targetCompletionDate?: Date;

  // Activity tracking
  studySessions: {
    scheduledAt: Date;
    completedAt?: Date;
    duration: number; // minutes
    notes?: string;
    attendees: mongoose.Types.ObjectId[];
  }[];

  // Performance tracking
  progressTracking: {
    partner1Progress: {
      initialScore: number;
      currentScore: number;
      questionsCompleted: number;
      studyHours: number;
    };
    partner2Progress: {
      initialScore: number;
      currentScore: number;
      questionsCompleted: number;
      studyHours: number;
    };
  };

  // Communication
  conversationId?: mongoose.Types.ObjectId;

  // Feedback
  feedback?: {
    providedBy: mongoose.Types.ObjectId;
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Partner Request Interface
 */
export interface IPartnerRequest extends Document {
  userId: mongoose.Types.ObjectId;
  criteria: IMatchCriteria;

  // Profile
  introduction: string;
  availability: {
    days: string[]; // 'monday', 'tuesday', etc.
    timeSlots: string[]; // 'morning', 'afternoon', etc.
  };

  // Preferences
  preferences: {
    groupSize: number; // 1 for 1-on-1, 2+ for small groups
    minAge?: number;
    maxAge?: number;
    sameGender?: boolean;
  };

  // Status
  isActive: boolean;
  matchedWith?: mongoose.Types.ObjectId[];
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Learning Partnership Schema
 */
const learningPartnershipSchema = new Schema<ILearningPartnership>(
  {
    partner1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    partner2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(PartnershipStatus),
      default: PartnershipStatus.PENDING
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    sharedGoals: [{
      type: String,
      maxlength: 200
    }],
    targetCompletionDate: Date,
    studySessions: [{
      scheduledAt: {
        type: Date,
        required: true
      },
      completedAt: Date,
      duration: {
        type: Number,
        required: true,
        min: 15
      },
      notes: {
        type: String,
        maxlength: 1000
      },
      attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    progressTracking: {
      partner1Progress: {
        initialScore: {
          type: Number,
          default: 0
        },
        currentScore: {
          type: Number,
          default: 0
        },
        questionsCompleted: {
          type: Number,
          default: 0
        },
        studyHours: {
          type: Number,
          default: 0
        }
      },
      partner2Progress: {
        initialScore: {
          type: Number,
          default: 0
        },
        currentScore: {
          type: Number,
          default: 0
        },
        questionsCompleted: {
          type: Number,
          default: 0
        },
        studyHours: {
          type: Number,
          default: 0
        }
      }
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation'
    },
    feedback: [{
      providedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

/**
 * Partner Request Schema
 */
const partnerRequestSchema = new Schema<IPartnerRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    criteria: {
      targetScore: {
        type: Number,
        required: true,
        min: 200,
        max: 990
      },
      currentScoreRange: {
        min: {
          type: Number,
          required: true
        },
        max: {
          type: Number,
          required: true
        }
      },
      targetSections: [{
        type: String,
        enum: ['grammar', 'vocabulary', 'listening', 'reading']
      }],
      preferredStudyTimes: [{
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      }],
      studyFrequency: {
        type: String,
        enum: ['daily', 'several-times-week', 'weekly'],
        required: true
      },
      learningStyle: {
        type: String,
        enum: ['visual', 'auditory', 'kinesthetic', 'mixed']
      },
      goals: [{
        type: String,
        maxlength: 200
      }]
    },
    introduction: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 500
    },
    availability: {
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      timeSlots: [{
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      }]
    },
    preferences: {
      groupSize: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
      },
      minAge: {
        type: Number,
        min: 13,
        max: 100
      },
      maxAge: {
        type: Number,
        min: 13,
        max: 100
      },
      sameGender: Boolean
    },
    isActive: {
      type: Boolean,
      default: true
    },
    matchedWith: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  },
  {
    timestamps: true
  }
);

// Indexes for LearningPartnership
learningPartnershipSchema.index({ partner1: 1, partner2: 1 });
learningPartnershipSchema.index({ status: 1 });
learningPartnershipSchema.index({ requestedBy: 1, createdAt: -1 });

// Indexes for PartnerRequest
partnerRequestSchema.index({ userId: 1, isActive: 1 });
partnerRequestSchema.index({ 'criteria.targetScore': 1 });
partnerRequestSchema.index({ 'criteria.currentScoreRange.min': 1, 'criteria.currentScoreRange.max': 1 });
partnerRequestSchema.index({ isActive: 1, expiresAt: 1 });

// Method: Accept partnership
learningPartnershipSchema.methods.accept = function() {
  this.status = PartnershipStatus.ACTIVE;
  this.acceptedAt = new Date();
};

// Method: Cancel partnership
learningPartnershipSchema.methods.cancel = function(userId: mongoose.Types.ObjectId) {
  this.status = PartnershipStatus.CANCELLED;
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
};

// Method: Complete partnership
learningPartnershipSchema.methods.complete = function() {
  this.status = PartnershipStatus.COMPLETED;
  this.completedAt = new Date();
};

// Method: Add study session
learningPartnershipSchema.methods.addStudySession = function(session: {
  scheduledAt: Date;
  duration: number;
  notes?: string;
}) {
  this.studySessions.push({
    ...session,
    attendees: []
  });
};

// Method: Add feedback
learningPartnershipSchema.methods.addFeedback = function(
  providedBy: mongoose.Types.ObjectId,
  rating: number,
  comment: string
) {
  this.feedback = this.feedback || [];
  this.feedback.push({
    providedBy,
    rating,
    comment,
    createdAt: new Date()
  });
};

// Method: Get partner for user
learningPartnershipSchema.methods.getPartnerFor = function(userId: mongoose.Types.ObjectId) {
  if (this.partner1.toString() === userId.toString()) {
    return this.partner2;
  } else if (this.partner2.toString() === userId.toString()) {
    return this.partner1;
  }
  return null;
};

// Method: Update progress for partner
learningPartnershipSchema.methods.updateProgress = function(
  userId: mongoose.Types.ObjectId,
  progress: {
    currentScore?: number;
    questionsCompleted?: number;
    studyHours?: number;
  }
) {
  const isPartner1 = this.partner1.toString() === userId.toString();
  const partnerProgress = isPartner1
    ? this.progressTracking.partner1Progress
    : this.progressTracking.partner2Progress;

  if (progress.currentScore !== undefined) {
    partnerProgress.currentScore = progress.currentScore;
  }
  if (progress.questionsCompleted !== undefined) {
    partnerProgress.questionsCompleted = progress.questionsCompleted;
  }
  if (progress.studyHours !== undefined) {
    partnerProgress.studyHours = progress.studyHours;
  }
};

/**
 * Partnership Models
 */
export const LearningPartnership = mongoose.model<ILearningPartnership>(
  'LearningPartnership',
  learningPartnershipSchema
);
export const PartnerRequest = mongoose.model<IPartnerRequest>(
  'PartnerRequest',
  partnerRequestSchema
);
