const express = require("express");
const multer = require("multer");
const { uploadToCloudinary } = require("../controllers/uploadController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, upload.single("file"), uploadToCloudinary);

module.exports = router;
