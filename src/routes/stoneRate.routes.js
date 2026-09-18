const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stoneRate.controller");

router.get("/", ctrl.getAll);
router.get("/current", ctrl.getCurrent);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
