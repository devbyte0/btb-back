require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Course = require("../models/Course");
const PromoCode = require("../models/PromoCode");
const { ROLES } = require("../constants/roles");

async function seedSampleData() {
  await connectDB();

  let admin = await User.findOne({ username: "sample_admin" });
  if (!admin) {
    admin = await User.create({
      name: "Sample Admin",
      username: "sample_admin",
      password: "sample_admin_123",
      role: ROLES.ADMIN,
    });
  }

  let trainer = await User.findOne({ username: "sample_trainer" });
  if (!trainer) {
    trainer = await User.create({
      name: "Sample Trainer",
      username: "sample_trainer",
      password: "sample_trainer_123",
      role: ROLES.TRAINER,
      createdBy: admin._id,
    });
  }

  const course = await Course.findOneAndUpdate(
    { title: "Professional Barista Bootcamp" },
    {
      title: "Professional Barista Bootcamp",
      description: "Hands-on barista training with latte art and machine operations.",
      durationDays: 15,
      basePrice: 12000,
      adminDiscountType: "percent",
      adminDiscountValue: 10,
      createdBy: trainer._id,
      isActive: true,
    },
    { new: true, upsert: true }
  );

  await PromoCode.findOneAndUpdate(
    { code: "WELCOME10" },
    {
      code: "WELCOME10",
      discountType: "percent",
      discountValue: 10,
      usageLimit: 200,
      usedCount: 0,
      isActive: true,
      applicableCourses: [course._id],
      createdBy: admin._id,
    },
    { upsert: true }
  );

  // eslint-disable-next-line no-console
  console.log("Sample data seeded successfully.");
  process.exit(0);
}

seedSampleData().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to seed sample data:", error.message);
  process.exit(1);
});
