const StoneType = require("../models/StoneType.model");

exports.getAll = async (req, res) => {
  try {
    const types = await StoneType.find().sort({ sortOrder: 1, label: 1 });
    res.json({ success: true, data: types });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const type = await StoneType.findById(req.params.id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Stone type not found" });
    res.json({ success: true, data: type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const type = await StoneType.create(req.body);
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const type = await StoneType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Stone type not found" });
    res.json({ success: true, data: type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const type = await StoneType.findByIdAndDelete(req.params.id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Stone type not found" });
    res
      .status(200)
      .json({ success: true, message: "Stone type deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
