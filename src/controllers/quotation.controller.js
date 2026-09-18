const Quotation = require("../models/Quotation.model");

// Generates a sequential-ish quotation number, e.g. QT-20260907-0001
const generateQuotationNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const countToday = await Quotation.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  return `QT-${datePart}-${String(countToday + 1).padStart(4, "0")}`;
};

exports.getAll = async (req, res) => {
  try {
    const { status, customer } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;

    const quotations = await Quotation.find(filter)
      .populate("customer", "name phoneNumber email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate(
      "customer",
    );
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const quotationNumber = await generateQuotationNumber();
    const quotation = await Quotation.create({ ...req.body, quotationNumber });
    res.status(201).json({ success: true, data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res
      .status(200)
      .json({ success: true, message: "Quotation deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
