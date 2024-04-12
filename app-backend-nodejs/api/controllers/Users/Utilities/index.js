const mongoose = require("mongoose");
const _ = require("lodash");
const axios = require("axios");

const User = require("../../../models/Users");
const Truck = require("../../../models/Truck");
const Incident = require("../../../models/Incident");
const sendSms = require("../../../utilities/send-sms").sendMsg;
const staticMsg = require("../../../static-messages/message.json");

//check the user exists in user table or not
const findUser = async query => {
  const user = await User.findOne(query).exec();
  return user;
};

// delete a existing user
exports.delete_user = (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.send({
        message: "User Deleted"
      });
    })
    .catch(err => {
      res.send({
        error: err
      });
    });
};

const addingDriverIdToTruck = async (user, truckId) => {
  let truckDetails = await Truck.find({ _id: truckId }).exec();
  if (!_.isEmpty(truckDetails)) {
    await Truck.updateOne({ _id: truckId }, { driver: user._id }).exec();
  }
};

// add driver from transporter
exports.addDriver = async (req, res, next) => {
  let query = { $and: [{ phone: req.body.phone }] };
  let response = [];
  try {
    // before adding driver, check the driver is already exists or not
    const user = await findUser(query);

    // if user is already exists, means isDeleted is false and created_by is not null,
    // type should be transporter and driver
    if (!_.isEmpty(user)) {
      if (
        !user.isDeleted &&
        user.created_by !== null &&
        (user.type === "transporter" || user.type === "driver")
      ) {
        addingDriverIdToTruck(user, req.body.truckId);
        response = user;
      } else if (
        user.isDeleted &&
        (user.type === "transporter" || user.type === "driver")
      ) {
        addingDriverIdToTruck(user, req.body.truckId);
        // if user exists, but user is already deleted means isDeleted=true,
        // then update the isDeleted: false and created_by: req.body.transpoterId
        await User.updateOne(query, {
          $set: {
            isDeleted: false,
            created_by: req.body.transpoterId,
            updated_by: null
          }
        }).exec();
        response = user;
      } else {
        return res.send({
          status: "ALREADY_EXISTS",
          message: `You Already Registered as ${user.type}`
        });
      }
    } else {
      // if user is not exists, then add the user in db
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        phone: req.body.phone,
        type: "driver",
        name: req.body.name,
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        },
        created_by: req.body.transpoterId,
        isDeleted: false
      });
      response = await user.save();
      // adding driverId to corresponding truck based on truckId
      addingDriverIdToTruck(response, req.body.truckId);
    }
    // get the transpoter details, for sending sms to corresponding driver
    let transpoter = await findUser({ _id: req.body.transpoterId });
    if (!_.isEmpty(transpoter)) {
      // after adding the driver successfully, send sms to driver
      sendSms(
        [response.phone],
        `${staticMsg.addDriver} ${transpoter.name}(${transpoter.phone}). ${staticMsg.rootDriver}`
      );
    }
    return res.send({
      status: "SUCCESS",
      message: "Driver Added Successfully",
      response: response
    });
  } catch (err) {
    return res.send({
      status: "ERROR",
      message: err.message
    });
  }
};

// get all drivers from transporter id
exports.getDriverByTranspoter = (req, res, next) => {
  const transpoterId = req.params.transpoterId;
  User.find({
    $and: [
      { created_by: transpoterId },
      { type: "driver" },
      { isDeleted: false }
    ]
  })
    .select("_id name phone type created_by created_at updated_at isDeleted")
    .exec()
    .then(response => {
      if (!_.isEmpty(response)) {
        return res.send({
          status: "SUCCESS",
          response
        });
      } else {
        return res.send({
          status: "NOT_FOUND",
          message: "No Drivers Found"
        });
      }
    })
    .catch(err => {
      return res.send({
        status: "ERROR",
        message: err.message
      });
    });
};

// delete the driver, here no physical delete from table but setting the flag isDeleted = true and
//updated_by = req.body.transpoterId(here transpoterId person who deleting the driver)
exports.deleteDriver = async (req, res, next) => {
  let userData = await User.find({
    $and: [{ _id: req.body.driverId }, { type: "driver" }]
  }).exec();
  if (!_.isEmpty(userData)) {
    User.updateOne(
      { $and: [{ _id: req.body.driverId }, { type: "driver" }] },
      {
        $set: {
          isDeleted: true,
          created_by: null,
          updated_by: req.body.transpoterId
        }
      }
    )
      .exec()
      .then(response => {
        return res.send({
          status: "SUCCESS",
          response
        });
      })
      .catch(err => {
        return res.send({
          status: "ERROR",
          message: err.message
        });
      });
  } else {
    return res.send({
      status: "ERROR",
      message: "No Driver Found"
    });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    let userData = await User.find().exec();
    if (!_.isEmpty(userData)) {
      return res.send({
        status: "SUCCESS",
        response: userData
      });
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "No user Found"
      });
    }
  } catch (err) {
    return res.send({
      status: "ERROR",
      message: err.message
    });
  }
};

// update city and state in users
exports.updateCityAndStateName = (req, res, next) => {
  User.find()
    .exec()
    .then(response => {
      if (!_.isEmpty(response)) {
        _.each(response, data => {
          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.location.lat},${data.location.lng}&key=AIzaSyCkW3dRvniHDCJPEfAliU9O9GuauZBkkj0`
            )
            .then(async result => {
              cityName = result.data.results[0].address_components.find(
                element => {
                  if (element.types.includes("locality")) {
                    return element.long_name;
                  }
                }
              );
              stateName = result.data.results[0].address_components.find(
                element => {
                  if (element.types.includes("administrative_area_level_1")) {
                    return element.long_name;
                  }
                }
              );
              data.location = {
                address: data.location.address,
                lat: data.location.lat,
                lng: data.location.lng,
                cityName: cityName.long_name,
                stateName: stateName.long_name
              };
              await User.updateOne(
                { _id: data._id },
                {
                  $set: {
                    location: data.location
                  }
                }
              ).exec();
            });
        });
        User.find()
          .exec()
          .then(data => {
            return res.send({
              status: "SUCCESS",
              response: data
            });
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

//update user's location
exports.updateUsersLocation = (req, res, next) => {
  const userId = req.params.userId;
  User.findByIdAndUpdate(
    { _id: userId },
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
    },
    { new: true }
  )
    .exec()
    .then(response => {
      return res.send({
        status: "SUCCESS",
        response
      });
    })
    .catch(error => {
      return res.send({ status: "ERROR", message: error.message });
    });
};

const makeId = (type, count) => {
  let result = "";
  let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let text = charset.charAt(Math.floor(Math.random() * charset.length));
  if (count < 9) {
    result = type.toUpperCase().substring(0, 2) + text + "0" + (count + 1);
  } else {
    result = type.toUpperCase().substring(0, 2) + text + (count + 1);
  }
  return result;
};

exports.creationOfUserId = async (req, res, next) => {
  try {
    let users = await User.find({ type: req.body.type }).exec();
    if (!_.isEmpty(users)) {
      // create userID for users
      _.each(users, async (user, index) => {
        let uid = makeId(user.type, index);
        await User.update({ _id: user._id }, { $set: { uid: uid } });
      });
      res.status(200).json({
        status: "SUCCESS",
        message: "Successfully Updated"
      });
    }
  } catch (error) {
    res.send({ status: "ERROR", message: error.message });
  }
};

// phone number cannot be having multiple type
// if he is admin cannot be reg. as representative
// if he is transporter cannot be reg. as driver
exports.updateUser = async (req, res, next) => {
  let filterData = [];
  let response = [];
  let adminData = await User.find({ type: "admin" }).exec();
  let transporterData = await User.find({ type: "transporter" }).exec();
  if (!_.isEmpty(adminData)) {
    let data = await User.find({
      $or: [
        { type: "driver" },
        { type: "transporter" },
        { type: "representative" }
      ]
    }).exec();
    _.each(adminData, async admin => {
      filterData = data.filter(user => {
        return admin.phone === user.phone;
      });
      if (!_.isEmpty(filterData)) {
        for (let user of filterData) {
          response = await User.updateOne(
            { _id: user._id },
            { $set: { isDeleted: true } }
          ).exec();
        }
      }
    });
  }

  if (!_.isEmpty(transporterData)) {
    let data = await User.find({ type: "driver" }).exec();
    _.each(transporterData, async admin => {
      filterData = data.filter(user => {
        return admin.phone === user.phone;
      });
      if (!_.isEmpty(filterData)) {
        for (let user of filterData) {
          response = await User.updateOne(
            { _id: user._id },
            { $set: { isDeleted: true } }
          ).exec();
        }
      }
    });
    return res.status(200).json({
      status: "SUCCESS",
      message: "Successfully Updated"
    });
  }
};

exports.updateUserId = async (req, res, next) => {
  const userIds = await User.find({
    $and: [{ phone: 6263124108 }, { type: "transporter" }]
  });
  const ids = [];
  userIds.map(d => {
    ids.push(d._id);
  });
  const idToBeUpdated = "5dcd00c72d87063a7104fad1";
  try {
    ids.map(async d => {
      const truck = await Truck.find({ owner: d });
      truck.map(async a => {
        await Truck.findByIdAndUpdate(
          { _id: a._id },
          { $set: { owner: idToBeUpdated } }
        );
      });
      const incident = await Incident.find({ owner: d });
      incident.map(async c => {
        await Incident.findByIdAndUpdate(
          { _id: c._id },
          { $set: { owner: idToBeUpdated } }
        );
      });
    });
    return res.send({
      message: "DOne"
    });
  } catch (error) {
    return req.send({ message: error.message });
  }
};

exports.updateUserForNewOne = async (req, res, next) => {
  const userIds = await User.find({
    $and: [{ phone: 7004756264 }, { type: "transporter" }]
  });
  const ids = [];
  userIds.map(d => {
    ids.push(d._id);
  });
  const idToBeUpdated = "5e204cad06f2126f83a018a7";
  try {
    ids.map(async d => {
      const truck = await Truck.find({ owner: d });
      truck.map(async a => {
        await Truck.findByIdAndUpdate(
          { _id: a._id },
          { $set: { owner: idToBeUpdated } }
        );
      });
      const incident = await Incident.find({ owner: d });
      incident.map(async c => {
        await Incident.findByIdAndUpdate(
          { _id: c._id },
          { $set: { owner: idToBeUpdated } }
        );
      });
    });
    return res.send({
      message: "DOne"
    });
  } catch (error) {
    return req.send({ message: error.message });
  }
};
