import { Request, Response, NextFunction } from 'express';
/**
 * Generate questions using AI
 */
export declare const generateQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Search questions with filters
 */
export declare const searchQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get question by ID
 */
export declare const getQuestionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get question bank statistics
 */
export declare const getQuestionBankStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Analyze official question patterns
 */
export declare const analyzeOfficialPatterns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Bulk import questions
 */
export declare const bulkImportQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update question review status
 */
export declare const updateQuestionStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Submit question answer and update user profile
 */
export declare const submitAnswer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get next adaptive question for user
 */
export declare const getNextAdaptiveQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Generate personalized study plan
 */
export declare const generateStudyPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get user learning profile
 */
export declare const getUserProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tepsQuestionController.d.ts.map