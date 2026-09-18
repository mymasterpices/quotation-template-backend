const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stonePriceChart.controller");

// Calculation must come before /:id so "calculate" isn't treated as an id
router.post("/calculate", ctrl.calculate);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

router.post("/:id/bands", ctrl.addBand);
router.put("/:id/bands/:bandIndex", ctrl.updateBand);
router.delete("/:id/bands/:bandIndex", ctrl.removeBand);

module.exports = router;
