const { asyncHandler } = require("../utils/asyncHandler");
const AboutUs = require("../models/AboutUs");
const { parseMediaUrl } = require("../utils/mediaUrlParser");

const getAboutUs = asyncHandler(async (_req, res) => {
  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) {
    about = await AboutUs.create({
      heroTitle: "We craft confident coffee professionals.",
      story: "Barista Training Bangladesh was built to transform coffee passion into a professional skill set. We blend international standards with local market insights so every student can thrive in specialty cafes at home and abroad.",
      mission: "To provide world-class barista education that empowers individuals with the skills, confidence, and creativity to excel in the coffee industry.",
      vision: "To become Bangladesh's most trusted coffee training academy, producing skilled baristas who elevate the specialty coffee culture nationwide.",
      stats: [
        { label: "Students Trained", value: "500+", icon: "🎓" },
        { label: "Expert Trainers", value: "12+", icon: "👨‍🏫" },
        { label: "Courses Offered", value: "8+", icon: "📚" },
        { label: "Placement Rate", value: "85%", icon: "🎯" },
      ],
    });
  }
  return res.status(200).json({ success: true, data: about });
});

const updateAboutUs = asyncHandler(async (req, res) => {
  const updates = {};
  ["heroTitle", "heroSubtitle", "story", "mission", "vision", "stats", "isActive"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  updates.updatedBy = req.user._id;

  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) {
    about = await AboutUs.create({ ...updates });
  } else {
    about = await AboutUs.findByIdAndUpdate(about._id, updates, { new: true });
  }
  return res.status(200).json({ success: true, data: about });
});

const addMediaItem = asyncHandler(async (req, res) => {
  const { url, title } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "URL is required" });

  const parsed = parseMediaUrl(url);
  if (!parsed.type) {
    return res.status(400).json({ success: false, message: "Could not parse media URL" });
  }

  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) {
    about = await AboutUs.create({
      heroTitle: "We craft confident coffee professionals.",
      mediaGallery: [],
    });
  }

  about.mediaGallery.push({
    ...parsed,
    title: title || "",
    order: about.mediaGallery.length,
  });
  about.updatedBy = req.user._id;
  await about.save();

  return res.status(201).json({ success: true, data: about });
});

const updateMediaItem = asyncHandler(async (req, res) => {
  const { mediaId } = req.params;
  const { url, title } = req.body;

  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) return res.status(404).json({ success: false, message: "About not found" });

  const item = about.mediaGallery.id(mediaId);
  if (!item) return res.status(404).json({ success: false, message: "Media item not found" });

  if (url !== undefined) {
    const parsed = parseMediaUrl(url);
    if (!parsed.type) return res.status(400).json({ success: false, message: "Could not parse URL" });
    item.url = parsed.url;
    item.embedUrl = parsed.embedUrl;
    item.type = parsed.type;
  }
  if (title !== undefined) item.title = title;

  about.updatedBy = req.user._id;
  await about.save();
  return res.status(200).json({ success: true, data: about });
});

const removeMediaItem = asyncHandler(async (req, res) => {
  const { mediaId } = req.params;
  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) return res.status(404).json({ success: false, message: "About not found" });

  about.mediaGallery.pull({ _id: mediaId });
  about.updatedBy = req.user._id;
  await about.save();

  return res.status(200).json({ success: true, data: about });
});

const reorderMedia = asyncHandler(async (req, res) => {
  const { mediaIds } = req.body;
  if (!Array.isArray(mediaIds)) {
    return res.status(400).json({ success: false, message: "mediaIds array required" });
  }

  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) return res.status(404).json({ success: false, message: "About not found" });

  const reordered = mediaIds
    .map((id, idx) => {
      const item = about.mediaGallery.id(id);
      if (item) {
        item.order = idx;
        return item;
      }
      return null;
    })
    .filter(Boolean);

  about.updatedBy = req.user._id;
  await about.save();

  return res.status(200).json({ success: true, data: about });
});

const addVideoItem = asyncHandler(async (req, res) => {
  const { url, title } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "URL is required" });
  const parsed = parseMediaUrl(url);
  if (!parsed.type || !["youtube", "facebook", "instagram", "tiktok", "vimeo"].includes(parsed.type)) {
    return res.status(400).json({ success: false, message: "Must be a video/social post URL (YouTube, Facebook, etc.)" });
  }
  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) {
    about = await AboutUs.create({ heroTitle: "We craft confident coffee professionals.", videoCollage: [] });
  }
  about.videoCollage.push({ ...parsed, title: title || "", order: about.videoCollage.length });
  about.updatedBy = req.user._id;
  await about.save();
  return res.status(201).json({ success: true, data: about });
});

const updateVideoItem = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { url, title } = req.body;
  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) return res.status(404).json({ success: false, message: "About not found" });
  const item = about.videoCollage.id(videoId);
  if (!item) return res.status(404).json({ success: false, message: "Video not found" });
  if (url !== undefined) {
    const parsed = parseMediaUrl(url);
    if (!parsed.type) return res.status(400).json({ success: false, message: "Could not parse URL" });
    item.url = parsed.url; item.embedUrl = parsed.embedUrl; item.type = parsed.type;
  }
  if (title !== undefined) item.title = title;
  about.updatedBy = req.user._id;
  await about.save();
  return res.status(200).json({ success: true, data: about });
});

const removeVideoItem = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let about = await AboutUs.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!about) return res.status(404).json({ success: false, message: "About not found" });
  about.videoCollage.pull({ _id: videoId });
  about.updatedBy = req.user._id;
  await about.save();
  return res.status(200).json({ success: true, data: about });
});

module.exports = { getAboutUs, updateAboutUs, addMediaItem, updateMediaItem, removeMediaItem, reorderMedia, addVideoItem, updateVideoItem, removeVideoItem };
