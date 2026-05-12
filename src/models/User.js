const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT },
    profilePic: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
