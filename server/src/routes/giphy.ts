import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || '';
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs';

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_width: { url: string; width: string; height: string };
    original: { url: string };
  };
}

function mapGifs(gifs: GiphyGif[]) {
  return gifs.map((g) => ({
    id: g.id,
    title: g.title,
    url: g.images.original.url,
    preview: g.images.fixed_width.url,
    width: Number(g.images.fixed_width.width),
    height: Number(g.images.fixed_width.height),
  }));
}

// GET /api/giphy/search?q=...
router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      res.json({ gifs: [] });
      return;
    }

    const url = `${GIPHY_BASE}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=pg-13`;
    const response = await fetch(url);
    const json = (await response.json()) as { data: GiphyGif[] };
    res.json({ gifs: mapGifs(json.data) });
  } catch (error) {
    console.error('Giphy search error:', error);
    res.status(500).json({ error: 'Failed to search GIFs' });
  }
});

// GET /api/giphy/trending
router.get('/trending', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const url = `${GIPHY_BASE}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=pg-13`;
    const response = await fetch(url);
    const json = (await response.json()) as { data: GiphyGif[] };
    res.json({ gifs: mapGifs(json.data) });
  } catch (error) {
    console.error('Giphy trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending GIFs' });
  }
});

export default router;
