import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Configure multer for image uploads
const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cocktail-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype.split('/')[1]);
    cb(null, extValid && mimeValid);
  },
});

// GET /api/cocktails — list all cocktails
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search, page = '1', limit = '12', sort = 'name' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? { name: { contains: String(search), mode: 'insensitive' as const } }
      : {};

    const orderBy = sort === 'recent' ? { createdAt: 'desc' as const } : { name: 'asc' as const };

    const [cocktails, total] = await Promise.all([
      prisma.cocktail.findMany({
        where,
        include: {
          ingredients: true,
          createdBy: { select: { id: true, name: true } },
          _count: { select: { favorites: true } },
          ...(req.userId
            ? { favorites: { where: { userId: req.userId }, take: 1 } }
            : {}),
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.cocktail.count({ where }),
    ]);

    const result = cocktails.map((c) => ({
      ...c,
      isFavorited: req.userId ? (c as any).favorites?.length > 0 : false,
      favoriteCount: (c as any)._count.favorites,
      favorites: undefined,
      _count: undefined,
    }));

    res.json({ cocktails: result, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('List cocktails error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cocktails/favorites — get user's favorites
router.get('/favorites', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: {
        cocktail: {
          include: {
            ingredients: true,
            createdBy: { select: { id: true, name: true } },
            _count: { select: { favorites: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const cocktails = favorites.map((f) => ({
      ...f.cocktail,
      isFavorited: true,
      favoriteCount: (f.cocktail as any)._count.favorites,
      _count: undefined,
    }));

    res.json({ cocktails });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cocktails/:id — get single cocktail
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const cocktail = await prisma.cocktail.findUnique({
      where: { id },
      include: {
        ingredients: true,
        createdBy: { select: { id: true, name: true } },
        _count: { select: { favorites: true } },
        ...(req.userId
          ? { favorites: { where: { userId: req.userId }, take: 1 } }
          : {}),
      },
    });

    if (!cocktail) {
      res.status(404).json({ error: 'Cocktail not found' });
      return;
    }

    res.json({
      ...cocktail,
      isFavorited: req.userId ? (cocktail as any).favorites?.length > 0 : false,
      favoriteCount: (cocktail as any)._count.favorites,
      favorites: undefined,
      _count: undefined,
    });
  } catch (error) {
    console.error('Get cocktail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cocktails — create cocktail
router.post('/', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, glassware, directions, ingredients } = req.body;

    if (!name || !glassware || !directions || !ingredients) {
      res.status(400).json({ error: 'Name, glassware, directions, and ingredients are required' });
      return;
    }

    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const cocktail = await prisma.cocktail.create({
      data: {
        name,
        glassware,
        directions,
        imageUrl,
        createdById: req.userId!,
        ingredients: {
          create: parsedIngredients.map((ing: { name: string; volume: string }) => ({
            name: ing.name,
            volume: ing.volume,
          })),
        },
      },
      include: {
        ingredients: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(cocktail);
  } catch (error) {
    console.error('Create cocktail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/cocktails/:id — update cocktail (owner only)
router.put('/:id', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.cocktail.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Cocktail not found' });
      return;
    }
    if (existing.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized to edit this cocktail' });
      return;
    }

    const { name, glassware, directions, ingredients, removeImage } = req.body;
    const parsedIngredients = ingredients
      ? typeof ingredients === 'string'
        ? JSON.parse(ingredients)
        : ingredients
      : undefined;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : removeImage === 'true'
        ? null
        : existing.imageUrl;

    const cocktail = await prisma.cocktail.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(glassware && { glassware }),
        ...(directions && { directions }),
        imageUrl,
        ...(parsedIngredients && {
          ingredients: {
            deleteMany: {},
            create: parsedIngredients.map((ing: { name: string; volume: string }) => ({
              name: ing.name,
              volume: ing.volume,
            })),
          },
        }),
      },
      include: {
        ingredients: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.json(cocktail);
  } catch (error) {
    console.error('Update cocktail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/cocktails/:id — delete cocktail (owner only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.cocktail.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Cocktail not found' });
      return;
    }
    if (existing.createdById !== req.userId && !req.isAdmin) {
      res.status(403).json({ error: 'Not authorized to delete this cocktail' });
      return;
    }

    await prisma.cocktail.delete({ where: { id } });
    res.json({ message: 'Cocktail deleted' });
  } catch (error) {
    console.error('Delete cocktail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cocktails/:id/favorite — toggle favorite
router.post('/:id/favorite', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const cocktail = await prisma.cocktail.findUnique({ where: { id } });
    if (!cocktail) {
      res.status(404).json({ error: 'Cocktail not found' });
      return;
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_cocktailId: { userId: req.userId!, cocktailId: id } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId: req.userId!, cocktailId: id },
      });
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
