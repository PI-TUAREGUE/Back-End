import moongose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    await moongose.connect(process.env.MONGO_URI!);
    console.log('Connectec to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
