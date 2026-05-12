require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

let cachedDb = false;

async function initialize() {
  if (!cachedDb) {
    await connectDB();
    cachedDb = true;
  }
}

module.exports = async (req, res) => {
  try {
    await initialize();
  } catch (err) {
    console.error("Failed to connect to DB:", err.message);
  }
  return app(req, res);
};
