const Metal = require("../models/Metal.model");

exports.getAll = async (req, res) => {
  try {
    const metals = await Metal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: metals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const metal = await Metal.findById(req.params.id);
    if (!metal)
      return res
        .status(404)
        .json({ success: false, message: "Metal not found" });
    res.json({ success: true, data: metal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const metal = await Metal.create(req.body);
    res.status(201).json({ success: true, data: metal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const metal = await Metal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!metal)
      return res
        .status(404)
        .json({ success: false, message: "Metal not found" });
    res.json({ success: true, data: metal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const metal = await Metal.findByIdAndDelete(req.params.id);
    if (!metal)
      return res
        .status(404)
        .json({ success: false, message: "Metal not found" });
    res
      .status(200)
      .json({ success: true, message: "Metal deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
