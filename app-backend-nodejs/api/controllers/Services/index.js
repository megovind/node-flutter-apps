const mongoose = require("mongoose");
const _ = require("lodash");

const Incident = require("../../models/Incident");
const Services = require("../../models/Services");
const User = require("../../models/Users");

// add services to service table
exports.addServices = async (req, res, next) => {
  try {
    // checking person who adding the services, is exists in service provider table or not
    const serviceProviderNotExists = await User.findOne({
      $and: [
        { phone: req.body.ownerNumber, type: req.body.serviceType },
        { isDeleted: false }
      ]
    }).exec();
    // if user not exists in service provider table, add user in service provider table
    if (_.isEmpty(serviceProviderNotExists)) {
      const servicesProvider = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.ownerName,
        phone: req.body.ownerNumber,
        type: req.body.serviceType,
        created_by: req.body.created_by,
        firmName: req.body.firmName,
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        }
      });
      await servicesProvider.save();
    }
    // check if service already exits, is not exits in service table, then save the data in db
    const data =
      req.body.serviceType === "crane"
        ? await Services.findOne({
          registrationNumber: req.body.registrationNumber.toUpperCase()
        }).exec()
        : await Services.findOne({
          $and: [{ phone: req.body.phone, serviceType: req.body.serviceType }]
        }).exec();

    if (_.isEmpty(data)) {
      const service = new Services({
        _id: new mongoose.Types.ObjectId(),
        created_by: req.body.created_by,
        registrationNumber: req.body.registrationNumber
          ? req.body.registrationNumber.toUpperCase()
          : null,
        name: req.body.name,
        phone: req.body.phone,
        serviceType: req.body.serviceType,
        capacity: req.body.capacity,
        ownerNumber: req.body.ownerNumber,
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        },
        isDeleted: false,
        image: req.body.imageUrl,
        specialization: req.body.specialization ? req.body.specialization : null
      });
      const responses = await service.save();
      return res.send({
        status: "SUCCESS",
        message: `You have added ${req.body.serviceType} successfully`,
        response: responses
      });
    } else {
      return res.send({
        status: "EXISTS",
        message: `${req.body.serviceType} already Exists`,
        response: data
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};


exports.edit_service = async (req, res) => {
  try {
    const service = {
      capacity: req.body.capacity,
      image: req.body.imageUrl,
      name: req.body.name,
      phone: req.body.phone,
      location: {
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        cityName: req.body.cityName,
        stateName: req.body.stateName
      },
      specialization: req.body.specialization ? req.body.specialization : null
    };
    const response = await Services.findByIdAndUpdate({ _id: req.params.id }, { $set: service }, { new: true });
    if (_.isEmpty(response)) {
      return res.send({ status: "ERROR", message: "Something went wrong!" });
    }
    return res.send({ status: "SUCCESS", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
}

// get all service by owner phone number
exports.getServicesByOwnerPhoneNumber = async (req, res, next) => {
  const ownerPh = req.params.ownerNumber;
  try {
    Services.find({ ownerNumber: ownerPh })
      .populate("specialization", "_id type")
      .exec()
      .then(service => {
        if (!_.isEmpty(service)) {
          return res.send({
            status: "SUCCESS",
            response: service
          });
        }
        return res.send({
          status: "NOT_FOUND",
          response: service
        });
      })
      .catch(error => {
        return res.send({
          status: "ERROR",
          message: error.message
        });
      });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// get all services
exports.getServices = async (req, res, next) => {
  try {
    let serviceData = [];
    const craneCount = await Services.countDocuments({
      serviceType: "crane",
      isDeleted: false
    });
    const mechanicCount = await Services.countDocuments({
      serviceType: "mechanic",
      isDeleted: false
    });
    serviceData = await Services.find({})
      .populate("specialization")
      .populate("created_by", "name");

    if (_.isEmpty(serviceData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Services Not Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response: serviceData,
      craneCount: craneCount ? craneCount : 0,
      mechanicCount: mechanicCount ? mechanicCount : 0
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// get all services by created by
exports.getServicesByCreatedBy = async (req, res, next) => {
  try {
    const createdBy = req.params.id;
    const response = await Services.find({ created_by: createdBy })
      .populate("specialization", "_id type")
      .exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Services Not Found"
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

exports.deleteServiceById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const serviceData = await Services.findOne({
      $and: [{ _id: id }, { isDeleted: false }]
    }).exec();
    if (!_.isEmpty(serviceData)) {
      const result = await Services.updateOne(
        { _id: serviceData._id },
        {
          $set: {
            isDeleted: true,
            created_by: null,
            updated_by: req.body.created_by
          }
        }
      ).exec();
      return res.send({
        status: "SUCCESS",
        message: "Service Deleted Successfully",
        response: result
      });
    } else {
      return res.send({ status: "NOT_FOUND", msg: "No services Found" });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// get services from website for network display
exports.getServiceForWeb = async (req, res, next) => {
  const protocol = req.params.protocol;
  const host = req.params.host;
  const isOkay = req.params.isOkay;
  const predifinedHost =
    process.env.NODE_ENV !== "production" ? "127.0.0.1:5500" : "root.in";
  const predefinedProtocol =
    process.env.NODE_ENV !== "production" ? "http:" : "https:";
  if (
    (host === predifinedHost || host === "www.root.in") &&
    protocol === predefinedProtocol &&
    isOkay
  ) {
    try {
      const serviceData = await Services.find()
        .select("location serviceType")
        .exec();
      if (!_.isEmpty(serviceData)) {
        return res.send({
          status: "SUCCESS",
          response: serviceData
        });
      }
      return res.send({
        status: "No Services Found",
        response: serviceData
      });
    } catch (error) {
      return res.send({
        status: "ERROR",
        message: error.message
      });
    }
  } else {
    return res.send({
      status: "SERVICES_NOT_FOUND",
      message: "No Services Found For This Location"
    });
  }
};

//push incidents count in services
exports.incidentCountInServices = async (req, res, next) => {
  try {
    const services = await Services.find().exec();

    services.map(async service => {
      const incidentCount = await Incident.countDocuments({
        service: { $in: [service._id] }
      });
      await Services.findByIdAndUpdate(
        { _id: service._id },
        { $set: { incidents: incidentCount } }
      );
    });
    return res.send({ message: "SUCCESS" });
  } catch (error) {
    return res.send({
      status: error.status,
      message: error.message
    });
  }
};
