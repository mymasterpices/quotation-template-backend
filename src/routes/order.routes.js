const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { createOrder, getOrders } = require("../controllers/order.controller");

// field name "images" must match fd.append('images', ...) on the frontend
router.post("/orders", upload.array("images", 10), createOrder);
router.get("/orders", getOrders);

module.exports = router;
