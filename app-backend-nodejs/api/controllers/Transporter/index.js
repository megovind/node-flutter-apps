const _ = require("lodash");

const User = require("../../models/Users");
const Truck = require("../../models/Truck");
const Incident = require("../../models/Incident");

const totalNumofTrucksperTransporter = async transporter => {
  let data = [];
  var newData = JSON.parse(JSON.stringify(transporter));
  for (let trans of newData) {
    const count = await Truck.find({ owner: trans._id })
      .countDocuments()
      .exec();
    trans.totalNumofTrucks = count;
    data.push(trans);
  }
  return !_.isEmpty(data) ? data : transporter;
};

const getIncidentCount = async user => {
  let data = [];
  const newData = JSON.parse(JSON.stringify(user));
  for (let usr of newData) {
    const count = await Incident.countDocuments({ owner: usr._id });
    usr.incidentsCount = count;
    data.push(usr);
  }
  return data;
};

exports.getAllTransporter = async (req, res, next) => {
  try {
    const response = await User.find({
      $and: [{ isDeleted: false }, { type: "transporter" }]
    }).exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Transporters Found"
      });
    }

    const truckCountRepsonse = await totalNumofTrucksperTransporter(response);
    const data = await getIncidentCount(truckCountRepsonse);
    return res.send({
      status: "SUCCESS",
      response: data
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.updateTransporter = async (req, res, next) => {
  try {
    const transporterId = req.params.id;
    let user = await User.findOne({ _id: transporterId }).exec();
    if (!_.isEmpty(user)) {
      let data = await User.updateOne(
        { _id: transporterId },
        {
          $set: {
            name: req.body.name,
            location: {
              address: req.body.address,
              lat: req.body.lat,
              lng: req.body.lng,
              stateName: req.body.stateName,
              cityName: req.body.cityName
            },
            organization: req.body.organization,
            gstIn: req.body.gstIn,
            panNumber: req.body.panNumber
          }
        }
      ).exec();
      return res.send({
        status: "SUCCESS",
        response: data
      });
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "No Transporters Found"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};
