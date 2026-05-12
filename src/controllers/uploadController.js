const { configureCloudinary } = require("../config/cloudinary");
const { asyncHandler } = require("../utils/asyncHandler");

const uploadToCloudinary = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const cloudinary = configureCloudinary();
  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const upload = await cloudinary.uploader.upload(base64, { folder: "btb-training" });

  return res.status(201).json({
    success: true,
    data: {
      url: upload.secure_url,
      publicId: upload.public_id,
      format: upload.format,
    },
  });
});

module.exports = { uploadToCloudinary };
