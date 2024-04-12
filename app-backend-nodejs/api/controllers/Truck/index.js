const mongoose = require("mongoose");
const _ = require("lodash");

const Truck = require("../../models/Truck");
const User = require("../../models/Users");
const Incident = require("../../models/Incident");

const registerTransporter = async transporter => {
  // if user not exists, save the user object in db.
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    phone: transporter.transporterNum,
    type: "transporter",
    name: transporter.transporterName,
    organization: transporter.organization,
    location: {
      address: transporter.address,
      lat: transporter.lat,
      lng: transporter.lng,
      cityName: transporter.cityName,
      stateName: transporter.stateName
    },
    created_by: transporter.created_by,
    acceptTerms: transporter.acceptTerms,
    isDeleted: false
  });

  const response = await user.save();
  return response._id;
};

exports.addTruck = async (req, res, next) => {
  try {
    let transporterId = "";
    const truckData = await Truck.find({ regNo: req.body.regNo }).exec();
    if (!req.body.owner) {
      const transporter = await User.findOne({
        $and: [{ phone: req.body.transporterNum }, { type: "transporter" }]
      });

      if (!_.isEmpty(transporter)) {
        transporterId = transporter._id;
      } else {
        transporterId = await registerTransporter(req.body);
      }
    }
    if (_.isEmpty(truckData)) {
      const truck = new Truck({
        _id: new mongoose.Types.ObjectId(),
        truckModel: req.body.truckModel,
        regNo: req.body.regNo,
        manufacturer: req.body.manufacturer,
        manufacturingDate: req.body.manufacturingDate,
        owner: req.body.owner ? req.body.owner : transporterId,
        rcImage: req.body.rcImage,
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        }
      });
      const response = await truck.save();
      return res.send({
        status: "SUCCESS",
        message: "Truck has been added succefully",
        response
      });
    } else {
      return res.send({
        status: "ERROR",
        message: "Truck is already Registered us"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//update truck details like model name, manufacturer and manufacturing date
exports.updateTruckDetails = async (req, res, next) => {
  try {
    const id = req.params.truckId;
    const truck = await Truck.find({ _id: id }).exec();
    if (!_.isEmpty(truck)) {
      const response = await Truck.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            truckModel: req.body.truckModel,
            manufacturer: req.body.manufacturer,
            manufacturingDate: req.body.manufacturingDate,
            rcImage: req.body.rcImage,
            location: {
              lat: req.body.lat,
              lng: req.body.lng,
              address: req.body.address,
              cityName: req.body.cityName,
              stateName: req.body.stateName
            }
          }
        },
        { new: true }
      ).exec();

      return res.send({
        status: "SUCCESS",
        response
      });
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

//update truck location
exports.updateTruckLocation = async (req, res, next) => {
  try {
    const id = req.params.truckId;
    const truck = await Truck.find({ _id: id }).exec();
    if (!_.isEmpty(truck)) {
      const response = await Truck.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            location: {
              address: req.body.address,
              lat: req.body.lat,
              lng: req.body.lng,
              cityName: req.body.cityName,
              stateName: req.body.stateName
            }
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
        message: "Truck Not Found"
      });
    }
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};

const getIncidentByTruck = async truck => {
  const truckRegNo = truck.regNo;
  const incident = await Incident.find({ truckRegNo: truckRegNo });
  return incident;
};

//get truck by id
exports.getTruckById = async (req, res, next) => {
  const truckId = req.params.truckId;
  try {
    const truck = await Truck.findOne({ _id: truckId })
      .populate("documents", "_id type url expiryDate created_at updated_at")
      .populate("owner", "_id type name phone email location")
      .populate("driver", "_id type name phone email location")
      .exec();
    const incidents = await getIncidentByTruck(truck);
    if (!_.isEmpty(truck)) {
      return res.send({
        status: "SUCCESS",
        response: {
          data: truck,
          incidents: incidents ? incidents : []
        }
      });
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

//to get truck by driver id
exports.getTruckByDriverId = async (req, res, next) => {
  const id = req.params.driverId;
  try {
    const truck = await Truck.find({ driver: id })
      .populate("documents", "_id type url expiryDate created_at updated_at")
      .populate("owner")
      .populate("driver")
      .exec();
    if (_.isEmpty(truck)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Truck Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response: truck
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//get truck by owner id
exports.getTruckByOwnerId = async (req, res, next) => {
  const id = req.params.userId;
  try {
    const truck = await Truck.find({ owner: id })
      .populate("documents", "_id type url expiryDate created_at updated_at")
      .populate("owner")
      .populate("driver")
      .exec();
    if (!_.isEmpty(truck)) {
      return res.send({
        status: "SUCCESS",
        response: truck
      });
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "No Truck Found"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.deleteTruck = async (req, res, next) => {
  try {
    const id = req.params.truckId;
    const response = await Truck.remove({ _id: id }).exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Truck Not Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      message: "Truck Deleted Successfully",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//get all trucks controller
exports.getTrucks = async (req, res, next) => {
  try {
    let query = {};
    let totalTrucks = 0;

    if (req.query.ownerId) {
      query = { owner: req.query.ownerId };
      totalTrucks = await Truck.find(query)
        .countDocuments()
        .exec();
    } else {
      totalTrucks = await Truck.find()
        .countDocuments()
        .exec();
    }

    const allTrucks = await Truck.find(query)
      .populate("owner")
      .exec();
    if (!_.isEmpty(allTrucks)) {
      const data = JSON.parse(JSON.stringify(allTrucks));
      return res.send({
        status: "SUCCESS",
        response: {
          totalTrucks: totalTrucks,
          data: data
        }
      });
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "No Truck Found"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.deleteDriverFromTruck = async (req, res, next) => {
  const truckId = req.params.truckId;
  const driverId = req.params.driverId;

  const updatedTruck = await Truck.findOneAndUpdate(
    {
      $and: [{ _id: truckId }, { driver: driverId }]
    },
    { $set: { driver: null }, $addToSet: { oldDrivers: driverId } },
    { new: true }
  );
  if (_.isEmpty(updatedTruck)) {
    return res.send({ status: "NOT_FOUND", message: "Truck Not Found" });
  }
  return res.send({ status: "SUCCESS", updatedTruck });
};

//Search Truck
exports.searchTruck = async (req, res, next) => {
  const query = req.params.query;
  try {
    const response = await Truck.find({ regNo: { $regex: query } })
      .populate("owner")
      .populate("driver");
    if (_.isEmpty(response)) {
      return res.send({ status: "ERROR", message: "Data not found" });
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

//update incidents counts in truck
exports.updateIncidentCount = async (req, res, next) => {
  const trucks = await Truck.find()
    .select("_id regNo")
    .exec();

  trucks.map(async truck => {
    const incidentCount = await Incident.countDocuments({
      $and: [{ truck: truck._id }, { truckRegNo: truck.regNo }]
    });
    const resp = await Truck.findByIdAndUpdate(
      { _id: truck._id },
      { $set: { incidents: incidentCount } }
    );
    if (_.isEmpty(resp)) {
      console.log("Not updated");
    } else {
      console.log("Updated successfully");
    }
  });
  return res.send({ message: "SUCCESS" });
};
