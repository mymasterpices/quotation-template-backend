const DiamondClarity = require("../models/DiamondClarity.model");

exports.getAll = async (req, res) => {
  try {
    const clarities = await DiamondClarity.find().sort({
      sortOrder: 1,
      label: 1,
    });
    res.json({ success: true, data: clarities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const clarity = await DiamondClarity.findById(req.params.id);
    if (!clarity)
      return res
        .status(404)
        .json({ success: false, message: "Diamond clarity not found" });
    res.json({ success: true, data: clarity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const clarity = await DiamondClarity.create(req.body);
    res.status(201).json({ success: true, data: clarity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const clarity = await DiamondClarity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!clarity)
      return res
        .status(404)
        .json({ success: false, message: "Diamond clarity not found" });
    res.json({ success: true, data: clarity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const clarity = await DiamondClarity.findByIdAndDelete(req.params.id);
    if (!clarity)
      return res
        .status(404)
        .json({ success: false, message: "Diamond clarity not found" });
    res
      .status(200)
      .json({ success: true, message: "Diamond clarity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
