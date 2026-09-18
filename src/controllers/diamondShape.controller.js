const DiamondShape = require("../models/DiamondShape.model");

exports.getAll = async (req, res) => {
  try {
    const shapes = await DiamondShape.find().sort({ sortOrder: 1, label: 1 });
    res.json({ success: true, data: shapes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const shape = await DiamondShape.findById(req.params.id);
    if (!shape)
      return res
        .status(404)
        .json({ success: false, message: "Diamond shape not found" });
    res.json({ success: true, data: shape });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const shape = await DiamondShape.create(req.body);
    res.status(201).json({ success: true, data: shape });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const shape = await DiamondShape.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!shape)
      return res
        .status(404)
        .json({ success: false, message: "Diamond shape not found" });
    res.json({ success: true, data: shape });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const shape = await DiamondShape.findByIdAndDelete(req.params.id);
    if (!shape)
      return res
        .status(404)
        .json({ success: false, message: "Diamond shape not found" });
    res
      .status(200)
      .json({ success: true, message: "Diamond shape deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
