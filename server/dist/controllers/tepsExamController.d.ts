import { Request, Response, NextFunction } from 'express';
/**
 * Create official TEPS simulation exam
 */
export declare const createOfficialSimulation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create micro-learning session
 */
export declare const createMicroLearning: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create section practice exam
 */
export declare const createSectionPractice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Start exam
 */
export declare const startExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get exam questions
 */
export declare const getExamQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Submit answer
 */
export declare const submitAnswer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Pause exam
 */
export declare const pauseExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Resume exam
 */
export declare const resumeExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Complete exam
 */
export declare const completeExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get exam result
 */
export declare const getExamResult: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get user exam history
 */
export declare const getExamHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get exam statistics
 */
export declare const getExamStatistics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Report suspicious activity (tab switching, fullscreen exit)
 */
export declare const reportActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tepsExamController.d.ts.map