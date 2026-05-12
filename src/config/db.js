const mongoose = require("mongoose");

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  await mongoose.connect(mongoURI);
  console.log("Connected To DB")
}

module.exports = connectDB;
