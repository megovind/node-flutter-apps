const mongoose = require("mongoose");
const _ = require("lodash");

const TripSchema = require("../../models/Trip");
const Truck = require("../../models/Truck");

exports.addTrip = async (req, res, next) => {
  try {
    const exists_data = await TripSchema.findOne({
      $and: [
        { truck: req.body.truck },
        {
          $or: [
            { trip_status: "yet to start" },
            { trip_status: "in progress" },
          ],
        },
      ],
    });

    if (!_.isEmpty(exists_data)) {
      return res.send({
        status: "EXISTS",
        message: "Trip already exists for this truck",
      });
    }

    const trip = new TripSchema({
      _id: new mongoose.Types.ObjectId(),
      truck: req.body.truck,
      driver: req.body.driver,
      owner: req.body.owner,
      source_location: req.body.source,
      destination_location: req.body.destination,
      trip_start_date: req.body.startDate,
      trip_end_date: req.body.endDate,
    });
    const response = await trip.save();
    await Truck.findByIdAndUpdate(
      { _id: req.body.truck },
      { $set: { trip: response._id } }
    );
    return res.send({
      status: "SUCCESS",
      message: "Trip has been added successfull",
      response: response,
    });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};

exports.getTripsByDriver = async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const response = await TripSchema.find({ driver: driverId })
      .populate("truck", "regNo truckModel")
      .populate("owner", "name phone")
      .populate("driver", "name phone")
      .exec();

    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "Trip not found" });
    }
    return res.send({ status: "SUCCESS", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};

exports.getTripsByOwner = async (req, res, next) => {
  try {
    const ownerId = req.params.id;
    const response = await TripSchema.find({ owner: ownerId })
      .populate("truck", "regNo truckModel")
      .populate("owner", "name phone")
      .populate("driver", "name phone")
      .exec();

    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "Trip not found" });
    }
    return res.send({ status: "SUCCESS", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};

exports.getTripsByTruck = async (req, res, next) => {
  try {
    const truckId = req.params.id;
    const response = await TripSchema.find({ truck: truckId })
      .populate("truck", "regNo truckModel")
      .populate("owner", "name phone")
      .populate("driver", "name phone")
      .exec();
    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "Trip not found" });
    }
    return res.send({ status: "SUCCESS", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const response = await TripSchema.findById({ _id: id })
      .populate("truck", "regNo truckModel")
      .populate("owner", "name phone")
      .populate("driver", "name phone")
      .exec();

    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "Trip not found" });
    }
    return res.send({ status: "SUCCESS", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};
