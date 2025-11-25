import express from 'express';
import {
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  regenerateBackupCodes,
  get2FAStatus,
} from '../controllers/twoFactorController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication except verify (which happens during login)
router.get('/status', authenticate, get2FAStatus);
router.post('/setup', authenticate, setup2FA);
router.post('/enable', authenticate, enable2FA);
router.post('/disable', authenticate, disable2FA);
router.post('/verify', verify2FA); // No auth required - used during login
router.post('/backup-codes/regenerate', authenticate, regenerateBackupCodes);

export default router;
