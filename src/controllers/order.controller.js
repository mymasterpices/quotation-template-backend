// controllers/order.controller.js
const Order = require("../models/order.model");

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body); // body already matches the schema shape
    const saved = await order.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};