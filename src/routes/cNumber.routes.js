const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/c-number.controller");

router.get("/", ctrl.getCNumber);
router.post("/", ctrl.createCNumber);
router.put("/", ctrl.updateCNumber);
router.delete("/:id", ctrl.deleteCNumber);

module.exports = router;
