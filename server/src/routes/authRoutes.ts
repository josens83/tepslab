import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  kakaoAuth,
  kakaoCallback,
  naverAuth,
  naverCallback,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  githubAuth,
  githubCallback,
  appleAuth,
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

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Facebook OAuth
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

// GitHub OAuth
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

// Apple Sign In
router.post('/apple', appleAuth);

export default router;
