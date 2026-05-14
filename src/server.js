require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { verifyConnection } = require("./utils/email");

const PORT = Number(process.env.PORT) || 5000;

async function boot() {
  await connectDB();
  verifyConnection();
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

boot().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to boot server:", error.message);
  process.exit(1);
});
