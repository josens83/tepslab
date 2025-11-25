import { Request, Response, NextFunction } from 'express';
/**
 * Start AI tutor session
 */
export declare const startSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Chat with AI tutor
 */
export declare const chat: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * End AI tutor session
 */
export declare const endSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get active session
 */
export declare const getActiveSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get session history
 */
export declare const getSessionHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Generate weekly coaching report
 */
export declare const getWeeklyReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create coaching session
 */
export declare const createCoachingSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Add learning habit
 */
export declare const addHabit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get daily motivation
 */
export declare const getDailyMotivation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get coaching session history
 */
export declare const getCoachingSessions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update habit completion
 */
export declare const completeHabit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get session analytics
 */
export declare const getSessionAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=enhancedAITutorController.d.ts.map