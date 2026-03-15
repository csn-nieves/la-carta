import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/wines — list all wines with average rating
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const wines = await prisma.wine.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
        ratings: { select: { stars: true } },
      },
    });

    const result = wines.map((w) => {
      const avg = w.ratings.length > 0
        ? w.ratings.reduce((sum, r) => sum + r.stars, 0) / w.ratings.length
        : null;
      return {
        id: w.id,
        name: w.name,
        locationPurchased: w.locationPurchased,
        createdBy: w.createdBy,
        createdAt: w.createdAt,
        averageRating: avg,
        ratingCount: w.ratings.length,
      };
    });

    res.json({ wines: result });
  } catch (error) {
    console.error('Fetch wines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/wines/:id — get wine detail with ratings/reviews
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const wine = await prisma.wine.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        ratings: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: { createdBy: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!wine) {
      res.status(404).json({ error: 'Wine not found' });
      return;
    }

    const averageRating = wine.ratings.length > 0
      ? wine.ratings.reduce((sum, r) => sum + r.stars, 0) / wine.ratings.length
      : null;

    res.json({
      wine: {
        ...wine,
        averageRating,
        ratingCount: wine.ratings.length,
        userRating: wine.ratings.find((r) => r.createdById === req.userId) ?? null,
      },
    });
  } catch (error) {
    console.error('Fetch wine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/wines — create a wine
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, locationPurchased } = req.body;

    if (!name?.trim() || !locationPurchased?.trim()) {
      res.status(400).json({ error: 'Name and location where purchased are required' });
      return;
    }

    const wine = await prisma.wine.create({
      data: {
        name: name.trim(),
        locationPurchased: locationPurchased.trim(),
        createdById: req.userId!,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ wine });
  } catch (error) {
    console.error('Create wine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/wines/:id — delete wine (creator or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const wine = await prisma.wine.findUnique({ where: { id } });

    if (!wine) {
      res.status(404).json({ error: 'Wine not found' });
      return;
    }

    if (wine.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.wine.delete({ where: { id } });
    res.json({ message: 'Wine deleted' });
  } catch (error) {
    console.error('Delete wine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/wines/:id/ratings — rate a wine (one per user)
router.post('/:id/ratings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { stars, review } = req.body;

    if (!stars || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      res.status(400).json({ error: 'Stars must be an integer between 1 and 5' });
      return;
    }

    const wine = await prisma.wine.findUnique({ where: { id } });
    if (!wine) {
      res.status(404).json({ error: 'Wine not found' });
      return;
    }

    const existing = await prisma.wineRating.findUnique({
      where: { wineId_createdById: { wineId: id, createdById: req.userId! } },
    });

    if (existing) {
      res.status(409).json({ error: 'You have already rated this wine' });
      return;
    }

    const rating = await prisma.wineRating.create({
      data: {
        stars,
        review: review?.trim() || null,
        wineId: id,
        createdById: req.userId!,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        replies: true,
      },
    });

    res.status(201).json({ rating });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/wines/:id/ratings/:ratingId — delete rating (author or admin)
router.delete('/:id/ratings/:ratingId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ratingId } = req.params as { id: string; ratingId: string };
    const rating = await prisma.wineRating.findUnique({ where: { id: ratingId } });

    if (!rating) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    if (rating.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.wineRating.delete({ where: { id: ratingId } });
    res.json({ message: 'Rating deleted' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/wines/:id/ratings/:ratingId/replies — reply to a review
router.post('/:id/ratings/:ratingId/replies', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ratingId } = req.params as { id: string; ratingId: string };
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const rating = await prisma.wineRating.findUnique({ where: { id: ratingId } });
    if (!rating) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    const reply = await prisma.wineReviewReply.create({
      data: {
        content: content.trim(),
        ratingId,
        createdById: req.userId!,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ reply });
  } catch (error) {
    console.error('Create review reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/wines/:id/ratings/:ratingId/replies/:replyId — delete reply (author or admin)
router.delete('/:id/ratings/:ratingId/replies/:replyId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params as { id: string; ratingId: string; replyId: string };
    const reply = await prisma.wineReviewReply.findUnique({ where: { id: replyId } });

    if (!reply) {
      res.status(404).json({ error: 'Reply not found' });
      return;
    }

    if (reply.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.wineReviewReply.delete({ where: { id: replyId } });
    res.json({ message: 'Reply deleted' });
  } catch (error) {
    console.error('Delete review reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
