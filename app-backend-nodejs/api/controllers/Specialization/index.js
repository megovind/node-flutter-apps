const _ = require("lodash");
const mongoose = require("mongoose");
const Specialization = require("../../models/Specialization");

exports.addSpecialization = async (req, res, next) => {
  try {
    const specialization = new Specialization({
      _id: new mongoose.Types.ObjectId(),
      type: req.body.type
    });
    const response = await specialization.save();
    return res.send({
      status: "SUCCESS",
      message: "issue Type added succefully",
      response
    });
  } catch (error) {
    res.send({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.getAllSpecialization = async (req, res, next) => {
  try {
    const response = await Specialization.find().exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT FOUND",
        message: "Service Types Not Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};
