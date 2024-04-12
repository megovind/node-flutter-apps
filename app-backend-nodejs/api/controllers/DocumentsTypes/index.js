const _ = require("lodash");
const mongoose = require("mongoose");
const documentTypes = require("../../models/DocumentsTypes");

exports.addDocumentTypes = async (req, res, next) => {
  try {
    const documenttypes = new documentTypes({
      _id: new mongoose.Types.ObjectId(),
      type: req.body.type
    });

    const response = await documenttypes.save();
    if (_.isEmpty(response)) {
      return res.send({
        status: "ERROR",
        message: "Not added, Please check"
      });
    }
    return res.send({
      status: "SUCCESS",
      message: "documents Types added succefully",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getAllDocumentTypes = async (req, res, next) => {
  try {
    const response = await documentTypes.find().exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Document Types Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response: response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};
