import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import jwt from 'jsonwebtoken';

interface SocketAuthPayload {
  id: string[];
  roles: string[];
}

let io: Server | null = null;

export function connectWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  console.log('Connected to Socket.IO');

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error('Autenticação necessária para o WebSocket'));
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return next(new Error('JWT não foi provido'));
    }

    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      const decoded = jwt.verify(cleanToken, secret) as SocketAuthPayload;
      socket.data.user = decoded;
      return next();
    } catch (error: any) {
      next(new Error(error));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user?.id;

    if (userId) {
      socket.join(userId);
    }

    socket.on('disconnect', () => {});

    console.log(`Client connected: ${socket.id}`);
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket não foi inicializado.');
  }
  return io;
}
