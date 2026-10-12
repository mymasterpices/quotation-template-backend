const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const {
  createOrder,
  getOrders,
  getOrderById,
} = require("../controllers/order.controller");

const { downloadOrderPdf } = require("../controllers/order.pdf.controller");

router.get("/orders/:id/pdf", downloadOrderPdf);
// field name "images" must match fd.append('images', ...) on the frontend
router.post("/orders", upload.array("images", 10), createOrder);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);

module.exports = router;
