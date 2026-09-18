const Gemstone = require("../models/Gemstone.model");

exports.getAll = async (req, res) => {
  try {
    const gemstones = await Gemstone.find().sort({ createdAt: -1 });
    res.json({ success: true, data: gemstones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone)
      return res
        .status(404)
        .json({ success: false, message: "Gemstone not found" });
    res.json({ success: true, data: gemstone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const gemstone = await Gemstone.create(req.body);
    res.status(201).json({ success: true, data: gemstone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const gemstone = await Gemstone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!gemstone)
      return res
        .status(404)
        .json({ success: false, message: "Gemstone not found" });
    res.json({ success: true, data: gemstone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const gemstone = await Gemstone.findByIdAndDelete(req.params.id);
    if (!gemstone)
      return res
        .status(404)
        .json({ success: false, message: "Gemstone not found" });
    res
      .status(200)
      .json({ success: true, message: "Gemstone deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
