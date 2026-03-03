import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import cocktailRoutes from './routes/cocktails';
import noteRoutes from './routes/notes';
import pushRoutes from './routes/push';

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}
app.use(express.json());

// Serve uploaded images
const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/push', pushRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve the built client
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  // SPA catch-all — serves index.html for all non-API routes
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
