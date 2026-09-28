// routes/order.routes.js
const express = require("express");
const router = express.Router();
const { createOrder, getOrders } = require("../controllers/order.controller");

router.post("/orders", createOrder);
router.get("/orders", getOrders);

module.exports = router;
