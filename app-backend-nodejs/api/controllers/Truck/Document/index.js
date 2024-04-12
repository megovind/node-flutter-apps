const mongoose = require("mongoose");
const _ = require("lodash");

const Truck = require("../../../models/Truck");
const TruckDocument = require("../../../models/Truck/Documents");

// add truck document
exports.addTruckDocuments = async (req, res, next) => {
  const truckId = req.params.truckId;
  try {
    const truckData = await Truck.findOne({ _id: truckId }).exec();
    if (!_.isEmpty(truckData)) {
      const truckDocument = new TruckDocument({
        _id: new mongoose.Types.ObjectId(),
        type: req.body.type,
        url: req.body.url,
        expiryDate: req.body.expiryDate
      });
      const response = await truckDocument.save();
      if (!_.isEmpty(response)) {
        await Truck.updateOne(
          { _id: truckData._id },
          { $push: { documents: response._id } }
        ).exec();

        return res.send({
          status: "SUCCESS",
          message: "Truck Documents has been updated succefully",
          response
        });
      }
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "Truck Not Found"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//update truck documents
exports.updateTruckDocs = async (req, res, next) => {
  try {
    const id = req.params.truckId;
    const docId = req.params.docId;
    const truck = await Truck.findById({ _id: id }).exec();
    const docs = await TruckDocument.findById({ _id: docId }).exec();
    if (!_.isEmpty(truck)) {
      if (!_.isEmpty(docs)) {
        const response = await TruckDocument.findByIdAndUpdate(
          { _id: docId },
          {
            $set: {
              url: req.body.url,
              expiryDate: req.body.expiryDate
            }
          }
        ).exec();
        return res.send({
          status: "SUCCESS",
          response
        });
      } else {
        return res.send({
          status: "NOT_FOUND",
          message: "Document Not Found"
        });
      }
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "Truck Not Found"
      });
    }
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};
