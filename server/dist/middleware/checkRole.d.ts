import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const checkRole: (rolesArg: string | string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export default checkRole;
//# sourceMappingURL=checkRole.d.ts.map