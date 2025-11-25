import { Request, Response, NextFunction } from 'express';
/**
 * Create study group
 */
export declare const createGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get group by ID
 */
export declare const getGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get all groups with filters
 */
export declare const getGroups: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get user's groups
 */
export declare const getUserGroups: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Join group
 */
export declare const joinGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Leave group
 */
export declare const leaveGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update group
 */
export declare const updateGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete group
 */
export declare const deleteGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update member role
 */
export declare const updateMemberRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Schedule study session
 */
export declare const scheduleSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Attend study session
 */
export declare const attendSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Complete study session
 */
export declare const completeSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get group statistics
 */
export declare const getGroupStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get recommended groups
 */
export declare const getRecommendedGroups: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=studyGroupController.d.ts.map