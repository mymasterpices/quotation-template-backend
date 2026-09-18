const MetalRate = require("../models/MetalRate.model");

exports.getAll = async (req, res) => {
  try {
    const rates = await MetalRate.find().sort({ effectiveDate: -1 });
    res.json({ success: true, data: rates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const rate = await MetalRate.findById(req.params.id);
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Metal rate not found" });
    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Returns the latest active rate for a given purity (used by the price calculator)
exports.getCurrent = async (req, res) => {
  try {
    const { purity, metalType = "GOLD", color } = req.query;
    if (!purity)
      return res
        .status(400)
        .json({ success: false, message: "purity is required" });

    const filter = { purity, metalType, isActive: true };
    if (color) filter.color = color;

    const rate = await MetalRate.findOne(filter).sort({ effectiveDate: -1 });
    if (!rate)
      return res
        .status(404)
        .json({
          success: false,
          message: "No active rate found for this purity",
        });

    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const rate = await MetalRate.create(req.body);
    res.status(201).json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const rate = await MetalRate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Metal rate not found" });
    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const rate = await MetalRate.findByIdAndDelete(req.params.id);
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Metal rate not found" });
    res
      .status(200)
      .json({ success: true, message: "Metal rate deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
