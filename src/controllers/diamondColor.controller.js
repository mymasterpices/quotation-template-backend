const DiamondColor = require("../models/DiamondColor.model");

exports.getAll = async (req, res) => {
  try {
    const colors = await DiamondColor.find().sort({ sortOrder: 1, label: 1 });
    res.json({ success: true, data: colors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const color = await DiamondColor.findById(req.params.id);
    if (!color)
      return res
        .status(404)
        .json({ success: false, message: "Diamond color not found" });
    res.json({ success: true, data: color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const color = await DiamondColor.create(req.body);
    res.status(201).json({ success: true, data: color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const color = await DiamondColor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!color)
      return res
        .status(404)
        .json({ success: false, message: "Diamond color not found" });
    res.json({ success: true, data: color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const color = await DiamondColor.findByIdAndDelete(req.params.id);
    if (!color)
      return res
        .status(404)
        .json({ success: false, message: "Diamond color not found" });
    res
      .status(200)
      .json({ success: true, message: "Diamond color deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
