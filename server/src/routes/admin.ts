import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

// GET /api/admin/users — list all users
router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { cocktails: true, notes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id — delete a user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (id === req.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/tags — list all tags
router.get('/tags', async (_req: AuthRequest, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { cocktails: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ tags });
  } catch (error) {
    console.error('List tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tags — create tag
router.post('/tags', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const tag = await prisma.tag.create({ data: { name: name.trim() } });
    res.status(201).json(tag);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Tag already exists' });
      return;
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/tags/:id — rename tag
router.put('/tags/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name } = req.body as { name: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const tag = await prisma.tag.update({ where: { id }, data: { name: name.trim() } });
    res.json(tag);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Tag already exists' });
      return;
    }
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/tags/:id — delete tag
router.delete('/tags/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.tag.delete({ where: { id } });
    res.json({ message: 'Tag deleted' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
