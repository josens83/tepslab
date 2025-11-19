"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Local authentication
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.get('/me', auth_1.authenticate, authController_1.getCurrentUser);
// Kakao OAuth
router.get('/kakao', authController_1.kakaoAuth);
router.get('/kakao/callback', authController_1.kakaoCallback);
// Naver OAuth
router.get('/naver', authController_1.naverAuth);
router.get('/naver/callback', authController_1.naverCallback);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map