const { asyncHandler } = require("../utils/asyncHandler");
const Carousel = require("../models/Carousel");

const listCarousels = asyncHandler(async (_req, res) => {
  const items = await Carousel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  return res.status(200).json({ success: true, data: items });
});

const listAllCarousels = asyncHandler(async (_req, res) => {
  const items = await Carousel.find().sort({ order: 1, createdAt: -1 });
  return res.status(200).json({ success: true, data: items });
});

const createCarousel = asyncHandler(async (req, res) => {
  const item = await Carousel.create({ ...req.body, createdBy: req.user._id });
  return res.status(201).json({ success: true, data: item });
});

const updateCarousel = asyncHandler(async (req, res) => {
  const item = await Carousel.findByIdAndUpdate(req.params.carouselId, req.body, { new: true });
  if (!item) return res.status(404).json({ success: false, message: "Carousel not found" });
  return res.status(200).json({ success: true, data: item });
});

const deleteCarousel = asyncHandler(async (req, res) => {
  const item = await Carousel.findByIdAndDelete(req.params.carouselId);
  if (!item) return res.status(404).json({ success: false, message: "Carousel not found" });
  return res.status(200).json({ success: true, message: "Carousel deleted" });
});

module.exports = { listCarousels, listAllCarousels, createCarousel, updateCarousel, deleteCarousel };
