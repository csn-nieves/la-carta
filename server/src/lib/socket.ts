import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export function initSocket(httpServer: HttpServer, isProd: boolean) {
  io = new Server(httpServer, {
    cors: isProd ? undefined : { origin: 'http://localhost:5173', credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-thread', (noteId: string) => {
      socket.join(`thread:${noteId}`);
    });

    socket.on('leave-thread', (noteId: string) => {
      socket.leave(`thread:${noteId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
