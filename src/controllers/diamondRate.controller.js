const DiamondRate = require("../models/DiamondRate.model");

exports.getAll = async (req, res) => {
  try {
    const rates = await DiamondRate.find().sort({ effectiveDate: -1 });
    res.json({ success: true, data: rates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const rate = await DiamondRate.findById(req.params.id);
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Diamond rate not found" });
    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCurrent = async (req, res) => {
  try {
    const { color, clarity, shape } = req.query;
    if (!color || !clarity) {
      return res
        .status(400)
        .json({ success: false, message: "color and clarity are required" });
    }

    const filter = { color, clarity, isActive: true };
    if (shape) filter.shape = shape;

    const rate = await DiamondRate.findOne(filter).sort({ effectiveDate: -1 });
    if (!rate)
      return res
        .status(404)
        .json({
          success: false,
          message: "No active rate found for this color/clarity",
        });

    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const rate = await DiamondRate.create(req.body);
    res.status(201).json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const rate = await DiamondRate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Diamond rate not found" });
    res.json({ success: true, data: rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const rate = await DiamondRate.findByIdAndDelete(req.params.id);
    if (!rate)
      return res
        .status(404)
        .json({ success: false, message: "Diamond rate not found" });
    res
      .status(200)
      .json({ success: true, message: "Diamond rate deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
