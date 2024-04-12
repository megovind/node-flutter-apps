const mongoose = require("mongoose");
const _ = require("lodash");

const Incident = require("../../models/Incident");
const IncidentPayment = require("../../models/Payments");
const Truck = require("../../models/Truck");
const User = require("../../models/Users");
const IncidentUpdates = require("../../models/Incident/updates");

const sendSms = require("../../utilities/send-sms").sendMsg;
const staticMsg = require("../../static-messages/message.json");

const {
  addIncident,
  saveUser,
  addTruck,
  updateAvailableServicesWithIncident,
  updateAvailableRepsWithIncident,
  updateServiceStatus,
  updateRepsStatus } = require("./utility")

//register incident
exports.registerIncident = async (req, res, next) => {
  try {
    let owner = "";
    let truck = await Truck.findOne({
      regNo: req.body.truckRegNo
    }).exec(); //find truck if it exists or not

    if (!_.isEmpty(truck)) {
      owner = truck.owner; // truck owner if truck exists
    } else {
      const transporter = await User.findOne({
        $and: [{ phone: req.body.ownerNum }, { type: "transporter" }]
      })
        .select("_id")
        .exec(); //check if the user exists or not
      if (!_.isEmpty(transporter)) {
        owner = transporter._id;
      } else {
        const response = await saveUser(req.body, "transporter"); // Register user then use id of the owner
        owner = response._id;
      }
      truck = await addTruck(req.body, owner); //here truck will be added
    }
    const result = await Incident.find({
      truckRegNo: req.body.truckRegNo,
      $or: [{ status: "in-progress" }, { status: "open" }]
    }).exec(); // check if the incident is already in open/in-progress for this truck

    if (_.isEmpty(result)) {
      await Truck.findOneAndUpdate(
        { _id: truck._id },
        { $inc: { incidents: 1 } }
      ).exec();
      const incident = await addIncident(req.body, truck);
      const result = await Incident.findOne({ _id: incident._id })
        .populate("specialization", "_id type")
        .populate("owner")
        .populate("driver")
        .populate("representative")
        .populate("service")
        .populate("payment")
        .populate("truck")
        .exec();

      await updateAvailableServicesWithIncident(incident);
      await updateAvailableRepsWithIncident(incident);
      //send message to owner
      const truckLocation = `https://maps.google.com/?q=${result.location.lat},${result.location.lng}`;

      const messageToOwner = encodeURI(
        `An Incident Registered By ${result.owner.phone} for truck ${req.body.truckRegNo}. ${staticMsg.truckLocation} ${truckLocation}.  ${staticMsg.rootApp}`
      );
      const messageToAdmins = encodeURI(
        `An Incident Registered By ${result.owner.phone} for truck ${req.body.truckRegNo}. They Need help with ${req.body.description}. ${staticMsg.truckLocation} ${truckLocation}.  ${staticMsg.rootAgentLink}`
      );
      const adminsMobile = [
        process.env.adminMobileNumber,
        process.env.admin1,
        process.env.admin2,
        process.env.admin3
      ];
      sendSms(adminsMobile, messageToAdmins); //send message to admins
      sendSms([result.owner.phone], messageToOwner); //send message

      return res.send({
        status: "SUCCESS",
        message: "Incident has been added successfully",
        response: result
      });
    }
    return res.send({
      status: "ALREADY_EXISTS",
      message: `An incident is already open or in-progress for the truck: ${req.body.truckRegNo}.`
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//update incident by id[inident specilization and description will be get updated]
exports.updateIncidentById = (req, res, next) => {
  const id = req.params.id;
  Incident.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        description: req.body.description,
        specialization: req.body.specialization,
        update_at: new Date(),
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        }
      }
    }
  )
    .exec()
    .then(response => {
      res.send({
        status: "SUCCESS",
        response
      });
    })
    .catch(error => {
      res.send({ status: "ERROR", message: error.message });
    });
};
//new incident updates controller
exports.incidentUpdates = async (req, res, next) => {
  const updatesId = req.params.id;
  const incidentId = req.params.incidentId;
  const body = req.body;
  try {
    if (updatesId === "null") {
      const update = new IncidentUpdates({
        _id: new mongoose.Types.ObjectId(),
        incidentId: incidentId,
        incidentLogs: body
      });
      updates = await update.save();
      await Incident.findByIdAndUpdate(
        { _id: incidentId },
        { $set: { updates: updates._id } }
      );
    } else {
      updates = await IncidentUpdates.findOneAndUpdate(
        {
          $and: [{ _id: updatesId }, { incidentId: incidentId }]
        },
        {
          $push: {
            incidentLogs: body
          }
        },
        { new: true }
      ).exec();
    }
    if (!_.isEmpty(updates)) {
      return res.send({
        status: "SUCCESS",
        response: updates.incidentLogs.slice(-1).pop()
      });
    }
    return res.send({
      status: "ERROR",
      message: "Logs can not update"
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getAllIncident = async (req, res, next) => {
  try {
    const result = await Incident.find()
      .select("_id caseId status description created_at")
      .populate("specialization", "_id type")
      .populate("owner", "_id name")
      .populate("truck", "_id regNo truckModel")
      .exec();
    if (!_.isEmpty(result)) {
      return res.send({
        status: "SUCCESS",
        response: result
      });
    }
    return res.send({
      status: "NOT FOUND",
      message: "Incidents Not Found"
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//to get incident by id
exports.getIncidentById = async (req, res, next) => {
  const incidentId = req.params.id;
  try {
    let result = await Incident.findById({ _id: incidentId })
      .populate("specialization", "_id type")
      .populate("owner")
      .populate("driver")
      .populate("representative")
      .populate("service")
      .populate("payment")
      .populate("truck")
      .populate("updates")
      .populate("availServices")
      .populate("availRepesentative")
      .exec();
    if (!_.isEmpty(result)) {
      return res.send({
        status: "SUCCESS",
        response: result
      });
    }
    return res.send({
      status: "NOT_FOUND",
      message: "No Incident Found"
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//to get incident by owner id
exports.getIncidentByTranspoterId = async (req, res, next) => {
  Incident.find({ owner: req.params.transpoterId })
    .select("_id caseId status description created_at location")
    .populate("specialization", "_id type")
    .populate("owner", "_id name")
    .populate("truck", "_id regNo truckModel")
    .populate("availServices")
    .populate("availRepesentative")
    .populate("representative")
    .exec()
    .then(async response => {
      if (!_.isEmpty(response)) {
        // if representative assigned, send the assigned representative details
        // if no representative found, then available reps will be null

        return res.send({
          status: "SUCCESS",
          response: response
        });
      } else {
        return res.send({
          status: "NOT FOUND",
          message: "No Incident Found"
        });
      }
    })
    .catch(error => {
      return res.send({
        status: "ERROR",
        message: error.message
      });
    });
};

//to get incidents by driver id
exports.getIncidentByDriverId = (req, res, next) => {
  Incident.find({ driver: req.params.driverId })
    .select("_id caseId status description created_at location")
    .populate("specialization", "_id type")
    .populate("owner", "_id name")
    .populate("truck", "_id regNo truckModel")
    .populate("availServices")
    .populate("availRepesentative")
    .populate("representative")
    .exec()
    .then(async response => {
      if (!_.isEmpty(response)) {
        return res.send({
          status: "SUCCESS",
          result: response
        });
      } else {
        return res.send({
          status: "NOT_FOUND",
          message: "No Incidents Found"
        });
      }
    })
    .catch(error => {
      return res.send({
        status: "ERROR",
        message: error.message
      });
    });
};


//update agent status parent
exports.updateRepresentative = async (req, res, next) => {
  const incidentId = req.params.incidentId;
  try {
    let incidentData = await Incident.findById({ _id: incidentId }).exec();
    if (!_.isEmpty(incidentData)) {
      if (
        _.isEmpty(incidentData.representative) &&
        _.isEmpty(incidentData.service) &&
        incidentData.status === "open"
      ) {
        const data = await updateRepsStatus(incidentId, req.body, "open");
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else if (
        !_.isEmpty(incidentData.representative) &&
        _.isEmpty(incidentData.service) &&
        incidentData.status === "open"
      ) {
        const data = await updateRepsStatus(incidentId, req.body, "open");
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else if (
        _.isEmpty(incidentData.representative) &&
        !_.isEmpty(incidentData.service) &&
        incidentData.status === "open"
      ) {
        const data = await updateRepsStatus(
          incidentId,
          req.body,
          "in-progress"
        );
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else if (
        !_.isEmpty(incidentData.representative) &&
        !_.isEmpty(incidentData.service) &&
        incidentData.status === "in-progress"
      ) {
        const data = await updateRepsStatus(
          incidentId,
          req.body,
          "in-progress"
        );
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else {
        return res.send({
          status: "INCIDENTS_ALREADY_COMPLETED",
          message: "Incidents Already Completed"
        });
      }
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "No Incidents Found"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};



//update services parent
exports.updateService = async (req, res, next) => {
  // update service id to incident
  // push service object to available services
  const incidentId = req.params.incidentId;
  try {
    let incidentData = await Incident.findById({ _id: incidentId }).exec();
    if (!_.isEmpty(incidentData)) {
      if (
        _.isEmpty(incidentData.representative) &&
        _.isEmpty(incidentData.service) &&
        incidentData.status === "open"
      ) {
        const data = await updateServiceStatus(incidentId, req.body, "open");
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else if (
        _.isEmpty(incidentData.representative) &&
        !_.isEmpty(incidentData.service) &&
        incidentData.status === "open"
      ) {
        const data = await updateServiceStatus(incidentId, req.body, "open");
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else if (
        !_.isEmpty(incidentData.representative) &&
        _.isEmpty(incidentData.service) &&
        incidentData.status === "open"
      ) {
        const data = await updateServiceStatus(
          incidentId,
          req.body,
          "in-progress"
        );
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else if (
        !_.isEmpty(incidentData.representative) &&
        !_.isEmpty(incidentData.service) &&
        incidentData.status === "in-progress"
      ) {
        const data = await updateServiceStatus(
          incidentId,
          req.body,
          "in-progress"
        );
        return res.send({
          status: "SUCCESS",
          response: data
        });
      } else {
        return res.send({
          status: "INCIDENTS_ALREADY_COMPLETED",
          message: "Incidents Already Completed"
        });
      }
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "Incident Not Found"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// complete Incident
exports.completeIncident = async (req, res, next) => {
  const incidentId = req.params.incidentId;
  const status = req.body.status;
  const amountPaid = req.body.amountPaid;
  const data =
    status === "completed"
      ? {
        status: status,
        completedAt: new Date(),
        paymentStatus: req.body.paymentStatus,
        availServices: [],
        availRepesentative: []
      }
      : {
        status: status,
        closed_at: new Date(),
        paymentStatus: req.body.paymentStatus
      };
  try {
    const incidentData = await Incident.findByIdAndUpdate(
      {
        _id: incidentId
      },
      {
        $set: data
      }
    ).exec();
    if (_.isEmpty(incidentData)) {
      return res.send({
        status: "ERROR",
        message: "Something went wrong"
      });
    }
    if (status === "closed") {
      await IncidentPayment.findOneAndUpdate(
        { incident: incidentId },
        { $set: { amount_paid: amountPaid, paid_on_date: new Date() } }
      );
    }

    return res.send({
      status: "SUCCESS",
      message: "Work has been completed"
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// get incidents by representativeId
// check representativeId exists in incident, if yes, then send the all corresponding incident of representative
exports.getIncidentsByrepresentative = async (req, res, next) => {
  const representativeId = req.params.representativeId;
  try {
    const incidentData = await Incident.find({
      representative: { $in: [representativeId] }
    })
      .select("_id caseId status description created_at")
      .populate("specialization", "_id type")
      .populate("owner", "_id name")
      .populate("truck", "_id regNo truckModel")
      .exec();
    if (_.isEmpty(incidentData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Incidents Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response: incidentData
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//to get open incidents by agent
exports.getOpenIncidentsByRepresentativeId = async (req, res, next) => {
  try {
    const representativeId = req.params.representativeId;
    const repData = await Incident.find({
      $and: [
        { status: "open" },
        { representative: { $in: [representativeId] } }
      ]
    })
      .populate("specialization")
      .populate("owner")
      .populate("driver")
      .populate("representative")
      .populate("service")
      .populate("payment")
      .exec();

    if (_.isEmpty(repData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Incidents Not Found"
      });
    }
    return res.send({ status: "SUCCESS", response: repData });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//update incident image by id
exports.updateIncidentImagesById = async (req, res, next) => {
  const incidentId = req.params.incidentId;
  try {
    let incidentData = await Incident.findOne({
      $and: [{ _id: incidentId }, { status: { $ne: "completed" } }]
    })
      .populate("specialization")
      .populate("payment")
      .exec();
    if (_.isEmpty(incidentData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Incidents Not Found"
      });
    }
    const updatedData = await Incident.findOneAndUpdate(
      { $and: [{ _id: incidentId }, { status: { $ne: "completed" } }] },
      { $push: { images: req.body.imageUrl } },
      { new: true }
    ).exec();
    return res.send({
      status: "SUCCESS",
      response: updatedData
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//get open or inprogress incidents by owner
exports.getOpenOrInProgressIncidentsByOwner = async (req, res, next) => {
  const owner = req.params.owner;
  try {
    const incidentData = await Incident.find({
      $and: [
        {
          $or: [{ status: "open" }, { status: "in-progress" }]
        },
        { owner: owner }
      ]
    })
      .select("_id caseId status description created_at")
      .populate("specialization", "_id type")
      .populate("owner", "_id name")
      .populate("truck", "_id regNo truckModel")
      .exec();
    if (_.isEmpty(incidentData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Open/InProgress Incidents for this Owner"
      });
    }
    return res.send({
      status: "SUCCESS",
      response: incidentData
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};


// Utilities===========

//update truckid in incident
exports.updateTruckIdInIncident = async (req, res, next) => {
  try {
    const incidets = await Incident.find();
    incidets.map(async data => {
      const truck = await Truck.findOne({ regNo: data.truckRegNo });
      await Incident.findByIdAndUpdate(
        { _id: data._id },
        { $set: { truck: truck._id } }
      );
    });
    return res.send({
      response: "updated successfully"
    });
  } catch (error) {
    return res.send({ error: error.message });
  }
};

//need to remove when it is done
//update updates in collection
exports.updateIncidentUpdatesLogs = async (req, res, next) => {
  try {
    const updates = await IncidentUpdates.find();
    updates.map(data => {
      data.incidentLogs.map(d => {
        if (d.images == null) {
          IncidentUpdates.updateOne(
            {
              _id: data._id,
              incidentLogs: { $elemMatch: { comment: d.comment } }
            },
            { $set: { "incidentLogs.$[elem].images": [] } },
            {
              arrayFilters: [{ "elem.images": { $eq: d.images } }]
            }
          )
            .exec()
            .then(response => {
              console.log("image is null and updates");
            })
            .catch(error => {
              console.log("null" + error.message);
            });
        } else {
          if (typeof d.images === "object") {
            if (!_.isEmpty(d.images)) {
              d.images.map(img => {
                if (_.isNull(img)) {
                  IncidentUpdates.updateOne(
                    {
                      _id: data._id,
                      incidentLogs: { $elemMatch: { comment: d.comment } }
                    },
                    { $set: { "incidentLogs.$[elem].images": [] } },
                    {
                      arrayFilters: [{ "elem.images": { $eq: d.images } }]
                    }
                  )
                    .exec()
                    .then(response => {
                      console.log("image is null and updates");
                    })
                    .catch(error => {
                      console.log("null" + error.message);
                    });
                } else if (img.length === 0) {
                  IncidentUpdates.updateOne(
                    {
                      _id: data._id,
                      incidentLogs: { $elemMatch: { comment: d.comment } }
                    },
                    { $set: { "incidentLogs.$[elem].images": [] } },
                    {
                      arrayFilters: [{ "elem.images": { $eq: d.images } }]
                    }
                  )
                    .exec()
                    .then(response => {
                      console.log("image is null and updates");
                    })
                    .catch(error => {
                      console.log("null" + error.message);
                    });
                }
              });
            }
          } else {
            if (d.images.length > 0) {
              IncidentUpdates.updateOne(
                {
                  _id: data._id,
                  incidentLogs: { $elemMatch: { comment: d.comment } }
                },
                { $set: { "incidentLogs.$[elem].images": [d.images] } },
                {
                  arrayFilters: [{ "elem.images": { $eq: d.images } }]
                }
              )
                .then(response => {
                  console.log(response);
                })
                .catch(error => {
                  console.log("string" + error.message);
                });
            } else {
              IncidentUpdates.updateOne(
                {
                  _id: data._id,
                  incidentLogs: { $elemMatch: { comment: d.comment } }
                },
                { $set: { "incidentLogs.$[elem].images": [] } },
                {
                  arrayFilters: [{ "elem.images": { $eq: d.images } }]
                }
              )
                .exec()
                .then(response => {
                  console.log("image is null and updates");
                })
                .catch(error => {
                  console.log("null" + error.message);
                });
            }
          }
        }
      });
    });
    res.send({ status: "SUCCESS: Updated" });
  } catch (error) {
    return res.send({
      error: error.message
    });
  }
};
