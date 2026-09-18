const StoneRate = require("../models/StoneRate.model");

exports.getAll = async (req, res) => {
  try {
    const rates = await StoneRate.find().sort({ effectiveDate: -1 });
    res.json({ success: true, data: rates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const rate = await StoneRate.findById(req.params.id);
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Stone rate not found" });
    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCurrent = async (req, res) => {
  try {
    const { stoneType, size, quality } = req.query;
    if (!stoneType || !size || !quality) {
      return res
        .status(400)
        .json({
          success: false,
          message: "stoneType, size and quality are required",
        });
    }

    const rate = await StoneRate.findOne({
      stoneType,
      size,
      quality,
      isActive: true,
    }).sort({ effectiveDate: -1 });
    if (!rate)
      return res
        .status(404)
        .json({
          success: false,
          message: "No active rate found for this stone spec",
        });

    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const rate = await StoneRate.create(req.body);
    res.status(201).json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const rate = await StoneRate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Stone rate not found" });
    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const rate = await StoneRate.findByIdAndDelete(req.params.id);
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Stone rate not found" });
    res
      .status(200)
      .json({ success: true, message: "Stone rate deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
