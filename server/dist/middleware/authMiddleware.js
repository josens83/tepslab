"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = exports.auth = exports.requireAdmin = exports.authorize = exports.authenticate = void 0;
// Re-export all auth middleware functions
var auth_1 = require("./auth");
Object.defineProperty(exports, "authenticate", { enumerable: true, get: function () { return auth_1.authenticate; } });
Object.defineProperty(exports, "authorize", { enumerable: true, get: function () { return auth_1.authorize; } });
Object.defineProperty(exports, "requireAdmin", { enumerable: true, get: function () { return auth_1.requireAdmin; } });
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return auth_1.auth; } });
// Alias for authenticate
var auth_2 = require("./auth");
Object.defineProperty(exports, "protect", { enumerable: true, get: function () { return auth_2.authenticate; } });
//# sourceMappingURL=authMiddleware.js.map