import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/bourbons — list all bourbons with average rating
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const bourbons = await prisma.bourbon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
        ratings: { select: { stars: true } },
      },
    });

    const result = bourbons.map((b) => {
      const avg = b.ratings.length > 0
        ? b.ratings.reduce((sum, r) => sum + r.stars, 0) / b.ratings.length
        : null;
      return {
        id: b.id,
        name: b.name,
        locationPurchased: b.locationPurchased,
        createdBy: b.createdBy,
        createdAt: b.createdAt,
        averageRating: avg,
        ratingCount: b.ratings.length,
      };
    });

    res.json({ bourbons: result });
  } catch (error) {
    console.error('Fetch bourbons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bourbons/:id — get bourbon detail with ratings/reviews
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const bourbon = await prisma.bourbon.findUnique({
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

    if (!bourbon) {
      res.status(404).json({ error: 'Bourbon not found' });
      return;
    }

    const averageRating = bourbon.ratings.length > 0
      ? bourbon.ratings.reduce((sum, r) => sum + r.stars, 0) / bourbon.ratings.length
      : null;

    res.json({
      bourbon: {
        ...bourbon,
        averageRating,
        ratingCount: bourbon.ratings.length,
        userRating: bourbon.ratings.find((r) => r.createdById === req.userId) ?? null,
      },
    });
  } catch (error) {
    console.error('Fetch bourbon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bourbons — create a bourbon
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, locationPurchased } = req.body;

    if (!name?.trim() || !locationPurchased?.trim()) {
      res.status(400).json({ error: 'Name and location where purchased are required' });
      return;
    }

    const bourbon = await prisma.bourbon.create({
      data: {
        name: name.trim(),
        locationPurchased: locationPurchased.trim(),
        createdById: req.userId!,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ bourbon });
  } catch (error) {
    console.error('Create bourbon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/bourbons/:id — delete bourbon (creator or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const bourbon = await prisma.bourbon.findUnique({ where: { id } });

    if (!bourbon) {
      res.status(404).json({ error: 'Bourbon not found' });
      return;
    }

    if (bourbon.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.bourbon.delete({ where: { id } });
    res.json({ message: 'Bourbon deleted' });
  } catch (error) {
    console.error('Delete bourbon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bourbons/:id/ratings — rate a bourbon (one per user)
router.post('/:id/ratings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { stars, review } = req.body;

    if (!stars || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      res.status(400).json({ error: 'Stars must be an integer between 1 and 5' });
      return;
    }

    const bourbon = await prisma.bourbon.findUnique({ where: { id } });
    if (!bourbon) {
      res.status(404).json({ error: 'Bourbon not found' });
      return;
    }

    const existing = await prisma.bourbonRating.findUnique({
      where: { bourbonId_createdById: { bourbonId: id, createdById: req.userId! } },
    });

    if (existing) {
      res.status(409).json({ error: 'You have already rated this bourbon' });
      return;
    }

    const rating = await prisma.bourbonRating.create({
      data: {
        stars,
        review: review?.trim() || null,
        bourbonId: id,
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

// DELETE /api/bourbons/:id/ratings/:ratingId — delete rating (author or admin)
router.delete('/:id/ratings/:ratingId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ratingId } = req.params as { id: string; ratingId: string };
    const rating = await prisma.bourbonRating.findUnique({ where: { id: ratingId } });

    if (!rating) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    if (rating.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.bourbonRating.delete({ where: { id: ratingId } });
    res.json({ message: 'Rating deleted' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bourbons/:id/ratings/:ratingId/replies — reply to a review
router.post('/:id/ratings/:ratingId/replies', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ratingId } = req.params as { id: string; ratingId: string };
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const rating = await prisma.bourbonRating.findUnique({ where: { id: ratingId } });
    if (!rating) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    const reply = await prisma.bourbonReviewReply.create({
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

// DELETE /api/bourbons/:id/ratings/:ratingId/replies/:replyId — delete reply (author or admin)
router.delete('/:id/ratings/:ratingId/replies/:replyId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params as { id: string; ratingId: string; replyId: string };
    const reply = await prisma.bourbonReviewReply.findUnique({ where: { id: replyId } });

    if (!reply) {
      res.status(404).json({ error: 'Reply not found' });
      return;
    }

    if (reply.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.bourbonReviewReply.delete({ where: { id: replyId } });
    res.json({ message: 'Reply deleted' });
  } catch (error) {
    console.error('Delete review reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
