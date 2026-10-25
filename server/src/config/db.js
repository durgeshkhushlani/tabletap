const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
