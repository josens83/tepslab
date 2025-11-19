import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  kakaoAuth,
  kakaoCallback,
  naverAuth,
  naverCallback,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Local authentication
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);

// Kakao OAuth
router.get('/kakao', kakaoAuth);
router.get('/kakao/callback', kakaoCallback);

// Naver OAuth
router.get('/naver', naverAuth);
router.get('/naver/callback', naverCallback);

export default router;
