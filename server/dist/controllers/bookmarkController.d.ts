import { Request, Response } from 'express';
export declare const getBookmarks: (req: Request, res: Response) => Promise<void>;
export declare const createBookmark: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBookmarkById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBookmark: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteBookmark: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteBookmarksByCourse: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=bookmarkController.d.ts.map