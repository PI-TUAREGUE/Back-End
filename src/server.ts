import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectMongoDB } from './shared/config/mongodb';
import { connectWebSocket } from './shared/config/webSocket';

const startServer = async () => {
  try {
    await connectMongoDB();

    const server = http.createServer(app);

    connectWebSocket(server);

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server listening on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server: ', error);
  }
};

startServer();
