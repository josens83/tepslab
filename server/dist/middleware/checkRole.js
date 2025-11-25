"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (rolesArg) => {
    const roles = Array.isArray(rolesArg) ? rolesArg : [rolesArg];
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to access this resource',
            });
            return;
        }
        next();
    };
};
exports.checkRole = checkRole;
exports.default = exports.checkRole;
//# sourceMappingURL=checkRole.js.map