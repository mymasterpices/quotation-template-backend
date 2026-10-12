const fs = require("fs");
const path = require("path");
const Order = require("../models/order.model");
const mongoose = require("mongoose");

// delete uploaded files if the order fails to save (avoid orphan files)
const cleanupFiles = (files = []) =>
  files.forEach((f) => fs.unlink(f.path, () => {}));

exports.createOrder = async (req, res) => {
  try {
    // With multipart, the JSON arrives as a string in req.body.data
    let body;
    try {
      body = req.body.data ? JSON.parse(req.body.data) : req.body;
    } catch {
      cleanupFiles(req.files);
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON in 'data' field" });
    }

    const images = (req.files || []).map((f) => ({
      name: f.originalname,
      filename: f.filename,
      url: `/uploads/${f.filename}`, // relative URL, served by express.static
      size: f.size,
      mimeType: f.mimetype,
    }));

    const order = new Order({ ...body, images });
    const saved = await order.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    cleanupFiles(req.files);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// list: restore the original
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// single order: new function with its own name
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};