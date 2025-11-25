import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Placeholder upload routes
router.post('/image', authenticate, (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'File upload not yet implemented',
  });
});

router.post('/video', authenticate, (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Video upload not yet implemented',
  });
});

router.delete('/:filename', authenticate, (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'File deletion not yet implemented',
  });
});

export default router;
