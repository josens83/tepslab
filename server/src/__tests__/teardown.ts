import mongoose from 'mongoose';

module.exports = async () => {
  // Close mongoose connection
  await mongoose.disconnect();

  // Stop MongoDB server
  const mongoServer = (global as any).__MONGO_SERVER__;
  if (mongoServer) {
    await mongoServer.stop();
  }
};
