import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/push/vapid-public-key — return the VAPID public key (no auth)
router.get('/vapid-public-key', (_req, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe — upsert a push subscription
router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ error: 'Invalid subscription object' });
      return;
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userId: req.userId! },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: req.userId!,
      },
    });

    res.json({ message: 'Subscribed' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/push/subscribe — remove a push subscription
router.delete('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint is required' });
      return;
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: req.userId! },
    });

    res.json({ message: 'Unsubscribed' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
