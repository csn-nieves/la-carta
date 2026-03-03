import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import webpush from '../lib/webpush';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notes — list all notes newest first
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.json({ notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notes — create a note
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const note = await prisma.note.create({
      data: {
        content: content.trim(),
        createdById: req.userId!,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ note });

    // Fire-and-forget: send push notifications to all other users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { not: req.userId! } },
    });

    const payload = JSON.stringify({
      title: `New note from ${note.createdBy.name}`,
      body: note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content,
    });

    for (const sub of subscriptions) {
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        .catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          console.error('Push send error:', err.statusCode ?? err.message);
        });
    }
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id — delete note (author only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (note.createdById !== req.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
