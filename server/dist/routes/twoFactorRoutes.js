"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const twoFactorController_1 = require("../controllers/twoFactorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication except verify (which happens during login)
router.get('/status', auth_1.authenticate, twoFactorController_1.get2FAStatus);
router.post('/setup', auth_1.authenticate, twoFactorController_1.setup2FA);
router.post('/enable', auth_1.authenticate, twoFactorController_1.enable2FA);
router.post('/disable', auth_1.authenticate, twoFactorController_1.disable2FA);
router.post('/verify', twoFactorController_1.verify2FA); // No auth required - used during login
router.post('/backup-codes/regenerate', auth_1.authenticate, twoFactorController_1.regenerateBackupCodes);
exports.default = router;
//# sourceMappingURL=twoFactorRoutes.js.map