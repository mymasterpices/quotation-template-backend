const Diamond = require("../models/Diamond.model");

exports.getAll = async (req, res) => {
  try {
    const diamonds = await Diamond.find().sort({ createdAt: -1 });
    res.json({ success: true, data: diamonds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const diamond = await Diamond.findById(req.params.id);
    if (!diamond)
      return res
        .status(404)
        .json({ success: false, message: "Diamond not found" });
    res.json({ success: true, data: diamond });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const diamond = await Diamond.create(req.body);
    res.status(201).json({ success: true, data: diamond });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const diamond = await Diamond.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!diamond)
      return res
        .status(404)
        .json({ success: false, message: "Diamond not found" });
    res.json({ success: true, data: diamond });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const diamond = await Diamond.findByIdAndDelete(req.params.id);
    if (!diamond)
      return res
        .status(404)
        .json({ success: false, message: "Diamond not found" });
    res
      .status(200)
      .json({ success: true, message: "Diamond deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
