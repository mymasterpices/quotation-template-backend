const PriceMaster = require("../models/PriceMaster.model");

exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const prices = await PriceMaster.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: prices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const price = await PriceMaster.findById(req.params.id);
    if (!price)
      return res
        .status(404)
        .json({ success: false, message: "Price entry not found" });
    res.json({ success: true, data: price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const price = await PriceMaster.create(req.body);
    res.status(201).json({ success: true, data: price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const price = await PriceMaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!price)
      return res
        .status(404)
        .json({ success: false, message: "Price entry not found" });
    res.json({ success: true, data: price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const price = await PriceMaster.findByIdAndDelete(req.params.id);
    if (!price)
      return res
        .status(404)
        .json({ success: false, message: "Price entry not found" });
    res
      .status(200)
      .json({ success: true, message: "Price entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Calculates a quotation estimate from live price master rates without saving it
exports.calculate = async (req, res) => {
  try {
    const {
      metal,
      diamond,
      stone,
      makingCharges = 0,
      taxPercent = 0,
    } = req.body;

    let metalAmount = 0,
      diamondAmount = 0,
      stoneAmount = 0;
    let metalRate = 0,
      diamondRate = 0,
      stoneRate = 0;

    if (metal?.weight) {
      const metalPrice = await PriceMaster.findOne({
        category: "METAL",
        purity: metal.purity,
        isActive: true,
      }).sort({ effectiveDate: -1 });
      metalRate = metalPrice?.ratePerGram || 0;
      metalAmount = metalRate * metal.weight;
    }

    if (diamond?.weight) {
      const diamondPrice = await PriceMaster.findOne({
        category: "DIAMOND",
        color: diamond.color,
        clarity: diamond.clarity,
        isActive: true,
      }).sort({ effectiveDate: -1 });
      diamondRate = diamondPrice?.ratePerCarat || 0;
      diamondAmount = diamondRate * diamond.weight;
    }

    if (stone?.weight) {
      const stonePrice = await PriceMaster.findOne({
        category: "GEMSTONE",
        stoneType: stone.type,
        size: stone.size,
        isActive: true,
      }).sort({ effectiveDate: -1 });
      stoneRate = stonePrice?.stoneRatePerCarat || 0;
      stoneAmount = stoneRate * stone.weight;
    }

    const subtotal =
      metalAmount + diamondAmount + stoneAmount + Number(makingCharges);
    const taxAmount = (subtotal * Number(taxPercent)) / 100;
    const totalAmount = subtotal + taxAmount;

    res.json({
      success: true,
      data: {
        metal: { ...metal, ratePerGram: metalRate, amount: metalAmount },
        diamond: {
          ...diamond,
          ratePerCarat: diamondRate,
          amount: diamondAmount,
        },
        stone: { ...stone, ratePerCarat: stoneRate, amount: stoneAmount },
        makingCharges: Number(makingCharges),
        taxPercent: Number(taxPercent),
        taxAmount,
        subtotal,
        totalAmount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
