import { Request, Response, NextFunction } from 'express';
export declare const getUserLevel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAchievements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserAchievements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markAchievementViewed: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getActiveChallenges: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserChallengeProgress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const claimChallengeRewards: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLeaderboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserLeaderboardPosition: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createAchievement: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createChallenge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=gamificationController.d.ts.map