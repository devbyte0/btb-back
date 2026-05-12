const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  mongoose.connection.on("connected", () => {
    isConnected = true;
    console.log("Connected To DB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("DB connection error:", err.message);
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
  });

  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: "majority",
  });
}

module.exports = connectDB;
