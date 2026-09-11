import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongoDB } from './shared/config/mongodb';

const startServer = async () => {
  try {
    await connectMongoDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server listening on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server: ', error);
  }
};

startServer();
