import { Request, Response, NextFunction } from 'express';
/**
 * Get dashboard data
 */
export declare const getDashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get analytics summary
 */
export declare const getAnalyticsSummary: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get score prediction
 */
export declare const getScorePrediction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get peer comparison
 */
export declare const getPeerComparison: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Add learning goal
 */
export declare const addGoal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get insights
 */
export declare const getInsights: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Check milestones
 */
export declare const checkMilestones: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get section performance details
 */
export declare const getSectionPerformance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get study patterns
 */
export declare const getStudyPatterns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get score trends
 */
export declare const getScoreTrends: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=learningAnalyticsController.d.ts.map