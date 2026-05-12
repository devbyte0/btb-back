require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");

async function seedSuperAdmin() {
  await connectDB();

  const username = (process.env.SEED_SUPER_ADMIN_USERNAME || "aliazom").toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "barista_king@azom";
  const name = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";

  const existing = await User.findOne({ username });
  if (existing) {
    existing.role = ROLES.SUPER_ADMIN;
    existing.name = name;
    if (process.env.SEED_FORCE_PASSWORD_RESET === "true") {
      existing.password = password;
    }
    await existing.save();
    // eslint-disable-next-line no-console
    console.log(`Super admin ensured for username: ${username}`);
    process.exit(0);
  }

  await User.create({
    name,
    username,
    password,
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  });
  // eslint-disable-next-line no-console
  console.log(`Super admin seeded with username: ${username}`);
  process.exit(0);
}

seedSuperAdmin().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to seed super admin:", error.message);
  process.exit(1);
});
