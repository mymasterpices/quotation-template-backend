const CNumber = require("../models/c-number.model");

exports.getCNumber = async (req, res) => {
  try {
    const cNumber = await CNumber.findOne();
    res.status(200).json(cNumber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCNumber = async (req, res) => {
  try {
    const cNumber = await CNumber.findOneAndUpdate({}, req.body);
    res.status(200).json(cNumber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCNumber = async (req, res) => {
  try {
    const cNumber = await CNumber.create(req.body);
    res.status(200).json(cNumber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCNumber = async (req, res) => {
  try {
    const cNumber = await CNumber.findByIdAndDelete(req.params.id);
    res.status(200).json(cNumber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
