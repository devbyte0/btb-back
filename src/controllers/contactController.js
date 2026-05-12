const { asyncHandler } = require("../utils/asyncHandler");
const ContactInquiry = require("../models/ContactInquiry");

const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.create(req.body);
  return res.status(201).json({ success: true, data: inquiry });
});

const listInquiries = asyncHandler(async (_req, res) => {
  const items = await ContactInquiry.find().sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: items });
});

const markReplied = asyncHandler(async (req, res) => {
  const { replyMessage } = req.body;
  const inquiry = await ContactInquiry.findByIdAndUpdate(
    req.params.inquiryId,
    { replied: true, repliedBy: req.user._id, replyMessage, repliedAt: new Date() },
    { new: true }
  );
  if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });
  return res.status(200).json({ success: true, data: inquiry });
});

const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.findByIdAndDelete(req.params.inquiryId);
  if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });
  return res.status(200).json({ success: true, message: "Inquiry deleted" });
});

module.exports = { createInquiry, listInquiries, markReplied, deleteInquiry };
