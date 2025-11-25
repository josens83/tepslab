import { Request, Response } from 'express';
export declare const getNotes: (req: Request, res: Response) => Promise<void>;
export declare const createNote: (req: Request, res: Response) => Promise<void>;
export declare const getNoteById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateNote: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteNote: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const searchNotes: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=noteController.d.ts.map