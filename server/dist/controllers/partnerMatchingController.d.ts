import { Request, Response, NextFunction } from 'express';
export declare const createPartnerRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPartnerRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePartnerRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deactivateRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const findMatches: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendPartnershipRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const acceptPartnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelPartnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const completePartnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserPartnerships: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addStudySession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProgress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addFeedback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPartnershipStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=partnerMatchingController.d.ts.map