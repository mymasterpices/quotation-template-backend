const StoneSize = require("../models/StoneSize.model");

exports.getAll = async (req, res) => {
  try {
    const sizes = await StoneSize.find().sort({ sortOrder: 1, label: 1 });
    res.json({ success: true, data: sizes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const size = await StoneSize.findById(req.params.id);
    if (!size)
      return res
        .status(404)
        .json({ success: false, message: "Stone size not found" });
    res.json({ success: true, data: size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const size = await StoneSize.create(req.body);
    res.status(201).json({ success: true, data: size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const size = await StoneSize.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!size)
      return res
        .status(404)
        .json({ success: false, message: "Stone size not found" });
    res.json({ success: true, data: size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const size = await StoneSize.findByIdAndDelete(req.params.id);
    if (!size)
      return res
        .status(404)
        .json({ success: false, message: "Stone size not found" });
    res
      .status(200)
      .json({ success: true, message: "Stone size deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
