const StonePriceChart = require("../models/StonePriceChart.model");
// GET /api/stone-price-charts
// Optional filters: ?stoneType=Diamond White&shape=Round
exports.getAll = async (req, res) => {
  try {
    const { stoneCode, shape } = req.query;
    const filter = {};
    if (stoneCode) filter.stoneCode = stoneCode;
    if (shape) filter.shape = shape;

    const charts = await StonePriceChart.find(filter).sort({
      stoneType: 1,
      shape: 1,
    });
    res.json({ success: true, data: charts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/stone-price-charts/:id
exports.getById = async (req, res) => {
  try {
    const chart = await StonePriceChart.findById(req.params.id);
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Price chart not found" });
    res.json({ success: true, data: chart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/stone-price-charts
exports.create = async (req, res) => {
  try {
    const chart = await StonePriceChart.create(req.body);
    res.status(201).json({ success: true, data: chart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/stone-price-charts/:id
exports.update = async (req, res) => {
  try {
    const chart = await StonePriceChart.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Price chart not found" });
    res.json({ success: true, data: chart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/stone-price-charts/:id
exports.remove = async (req, res) => {
  try {
    const chart = await StonePriceChart.findByIdAndDelete(req.params.id);
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Price chart not found" });
    res
      .status(200)
      .json({ success: true, message: "Price chart deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Band-level operations (add/update/remove a single band without replacing the whole document) ---

// POST /api/stone-price-charts/:id/bands
exports.addBand = async (req, res) => {
  try {
    const chart = await StonePriceChart.findById(req.params.id);
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Price chart not found" });

    chart.bands.push(req.body);
    await chart.save();

    res.status(201).json({ success: true, data: chart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/stone-price-charts/:id/bands/:bandIndex
exports.updateBand = async (req, res) => {
  try {
    const chart = await StonePriceChart.findById(req.params.id);
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Price chart not found" });

    const index = parseInt(req.params.bandIndex, 10);
    if (!chart.bands[index]) {
      return res
        .status(404)
        .json({ success: false, message: "Band not found at this index" });
    }

    chart.bands[index] = { ...chart.bands[index].toObject(), ...req.body };
    await chart.save();

    res.json({ success: true, data: chart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/stone-price-charts/:id/bands/:bandIndex
exports.removeBand = async (req, res) => {
  try {
    const chart = await StonePriceChart.findById(req.params.id);
    if (!chart)
      return res
        .status(404)
        .json({ success: false, message: "Price chart not found" });

    const index = parseInt(req.params.bandIndex, 10);
    if (!chart.bands[index]) {
      return res
        .status(404)
        .json({ success: false, message: "Band not found at this index" });
    }

    chart.bands.splice(index, 1);
    await chart.save();

    res.status(200).json({
      success: true,
      message: "Band removed successfully",
      data: chart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- The core pricing calculation ---

// POST /api/stone-price-charts/calculate
// Body: { stoneType, shape?, weight, grade? }
// Diamonds (GRADE_BANDED)      -> requires shape + grade
// Colored stones (SIZE_BANDED_FLAT) -> requires just weight (no shape/grade needed)
// Simple stones (SINGLE_FLAT)  -> requires just weight
exports.calculate = async (req, res) => {
  try {
    const { stoneType, shape, weight, grade, stoneCode } = req.body;

    if (!stoneType === null) {
      return res
        .status(400)
        .json({ success: false, message: "stoneType and weight are required" });
    }

    const filter = { stoneType, isActive: true };
    if (shape) filter.shape = shape;

    const chart = await StonePriceChart.findOne(filter);
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: "No active price chart found for this stone/shape",
      });
    }

    const band = chart.bands.find(
      (b) => weight >= b.sizeMin && weight <= b.sizeMax,
    );
    if (!band) {
      return res.status(404).json({
        success: false,
        message: `No price band covers a weight of ${weight}ct for ${stoneType}${shape ? " (" + shape + ")" : ""}`,
      });
    }

    let rate;

    if (chart.pricingModel === "GRADE_BANDED") {
      if (!grade) {
        return res.status(400).json({
          success: false,
          message: "grade is required for this stone type",
        });
      }
      rate = band.gradeRates ? band.gradeRates[grade] : undefined;
    } else {
      // SIZE_BANDED_FLAT or SINGLE_FLAT
      rate = band.flatRate;
    }

    if (rate === undefined || rate === null) {
      return res.status(404).json({
        success: false,
        message: "No rate configured for this selection",
      });
    }

    const amount = Math.round(rate * weight * 100) / 100;

    res.json({
      success: true,
      data: {
        stoneType: chart.stoneType,
        shape: chart.shape || null,
        pricingModel: chart.pricingModel,
        weight,
        grade: grade || null,
        rate,
        amount,
        matchedBand: { sizeMin: band.sizeMin, sizeMax: band.sizeMax },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
