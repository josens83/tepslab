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
// Google OAuth
router.get('/google', authController_1.googleAuth);
router.get('/google/callback', authController_1.googleCallback);
// Facebook OAuth
router.get('/facebook', authController_1.facebookAuth);
router.get('/facebook/callback', authController_1.facebookCallback);
// GitHub OAuth
router.get('/github', authController_1.githubAuth);
router.get('/github/callback', authController_1.githubCallback);
// Apple Sign In
router.post('/apple', authController_1.appleAuth);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map