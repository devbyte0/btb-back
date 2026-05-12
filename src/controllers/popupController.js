const { asyncHandler } = require("../utils/asyncHandler");
const Popup = require("../models/Popup");

const getActivePopup = asyncHandler(async (_req, res) => {
  const now = new Date();
  const popup = await Popup.findOne({
    isActive: true,
    $or: [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
    ],
  }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: popup || null });
});

const listPopups = asyncHandler(async (_req, res) => {
  const popups = await Popup.find().sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: popups });
});

const createPopup = asyncHandler(async (req, res) => {
  const popup = await Popup.create({ ...req.body, createdBy: req.user._id });
  return res.status(201).json({ success: true, data: popup });
});

const updatePopup = asyncHandler(async (req, res) => {
  const popup = await Popup.findByIdAndUpdate(req.params.popupId, req.body, { new: true });
  if (!popup) return res.status(404).json({ success: false, message: "Popup not found" });
  return res.status(200).json({ success: true, data: popup });
});

const deletePopup = asyncHandler(async (req, res) => {
  const popup = await Popup.findByIdAndDelete(req.params.popupId);
  if (!popup) return res.status(404).json({ success: false, message: "Popup not found" });
  return res.status(200).json({ success: true, message: "Popup deleted" });
});

module.exports = { getActivePopup, listPopups, createPopup, updatePopup, deletePopup };
