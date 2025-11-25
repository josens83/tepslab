import { Request, Response } from 'express';
/**
 * Chat with AI tutor
 */
export declare const chatWithTutor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Explain a question
 */
export declare const explainQuestion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Analyze weak points
 */
export declare const analyzeWeakPoints: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Generate practice questions
 */
export declare const generatePracticeQuestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Evaluate pronunciation
 */
export declare const evaluatePronunciation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get AI tutor availability
 */
export declare const getTutorStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=aiTutorController.d.ts.map