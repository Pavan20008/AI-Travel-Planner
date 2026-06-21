const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Windows networks sometimes block default DNS SRV lookups for mongodb+srv URIs
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
