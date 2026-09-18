const MetalPurity = require("../models/MetalPurity.model");

exports.getAll = async (req, res) => {
  try {
    const purities = await MetalPurity.find().sort({ sortOrder: 1, label: 1 });
    res.json({ success: true, data: purities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const purity = await MetalPurity.findById(req.params.id);
    if (!purity)
      return res
        .status(404)
        .json({ success: false, message: "Purity not found" });
    res.json({ success: true, data: purity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const purity = await MetalPurity.create(req.body);
    res.status(201).json({ success: true, data: purity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const purity = await MetalPurity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!purity)
      return res
        .status(404)
        .json({ success: false, message: "Purity not found" });
    res.json({ success: true, data: purity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const purity = await MetalPurity.findByIdAndDelete(req.params.id);
    if (!purity)
      return res
        .status(404)
        .json({ success: false, message: "Purity not found" });
    res
      .status(200)
      .json({ success: true, message: "Purity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
