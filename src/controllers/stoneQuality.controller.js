const StoneQuality = require("../models/StoneQuality.model");

exports.getAll = async (req, res) => {
  try {
    const qualities = await StoneQuality.find().sort({
      sortOrder: 1,
      label: 1,
    });
    res.json({ success: true, data: qualities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const quality = await StoneQuality.findById(req.params.id);
    if (!quality)
      return res
        .status(404)
        .json({ success: false, message: "Stone quality not found" });
    res.json({ success: true, data: quality });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const quality = await StoneQuality.create(req.body);
    res.status(201).json({ success: true, data: quality });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const quality = await StoneQuality.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!quality)
      return res
        .status(404)
        .json({ success: false, message: "Stone quality not found" });
    res.json({ success: true, data: quality });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const quality = await StoneQuality.findByIdAndDelete(req.params.id);
    if (!quality)
      return res
        .status(404)
        .json({ success: false, message: "Stone quality not found" });
    res
      .status(200)
      .json({ success: true, message: "Stone quality deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
