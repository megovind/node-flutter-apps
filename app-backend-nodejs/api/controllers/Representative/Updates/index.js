//apis to update logtime both in and out
//api to comment//updates
//api to get updates by userId
const mongoose = require("mongoose");
const _ = require("lodash");

const Updates = require("../../models/representative/update");

//signIn open a update or start
exports.signIn = (req, res, next) => {
  const signInData = new Updates({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body.userId,
    signInTime: req.body.signinTime,
    startLocation: {
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng
    } //location will have address, lat, lang
  });
  signInData
    .save()
    .then(response => {
      res.status(200).json({
        status: "SUCCESS",
        response
      });
    })
    .catch(error => {
      res.send({
        status: "ERROR",
        message: error.message
      });
    });
};

//to signout or close the update by id
exports.signOut = (req, res, next) => {
  const id = req.params.id;
  try {
    Updates.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          signOutTime: req.body.signOutTime,
          signOutLocation: {
            address: req.body.address,
            lat: req.body.lat,
            lng: req.body.lng
          }
        }
      },
      { new: true }
    )
      .exec()
      .then(response => {
        res.status(200).json({
          status: "SUCCESS",
          response
        });
      });
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//update starting point
exports.updateStartPoint = (req, res, next) => {
  const id = req.params.id;
  try {
    Updates.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          logs: {
            _id: new mongoose.Types.ObjectId(),
            startTime: req.body.startTime,
            startLocation: {
              address: req.body.address,
              lat: req.body.lat,
              lng: req.body.lng
            },
            endLocation: null,
            endTime: null
          }
        }
      },
      { new: true }
    )
      .exec()
      .then(response => {
        res.json({
          status: "SUCCESS",
          response
        });
      });
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//update endpoint
exports.updateEndPoint = (req, res, next) => {
  const id = req.params.id;
  const index = req.params.index;
  try {
  } catch (error) {}
};

//update logs of a update by id
exports.updateLogs = (req, res, next) => {
  const id = req.params.id;
  try {
    Updates.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          updates: {
            _id: new mongoose.Types.ObjectId(),
            comment: req.body.comment,
            dateTime: req.body.dateTime
          }
        }
      },
      { new: true }
    )
      .exec()
      .then(response => {
        res.status(200).json({
          status: "SUCCESS",
          response
        });
      });
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//open update means, which has not been closed or no signouttime in that
exports.getOpenUpdate = async (req, res, next) => {
  const userId = req.params.userId;
  const openUpdate = await Updates.findOne({
    $and: [{ userId: userId }, { signOutTime: null }]
  }).exec();
  try {
    if (!_.isEmpty(openUpdate)) {
      openUpdate.then(response => {
        res.status(200).json({
          status: "SUCCESS",
          response
        });
      });
    } else {
      res.send({
        status: "NOT_FOUND",
        message: "Open Updates Not Found"
      });
    }
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// all updates except which in not yet closed mean not have signout time
exports.getAllUpdates = async (req, res, next) => {
  const userId = req.params.userId;
  const updates = await Updates.find({
    $and: [
      { userId: userId },
      { signOutTime: { $exists: true, $not: { $size: 0 } } }
    ]
  });
  try {
    if (!_.isEmpty(updates)) {
      updates.then(response => {
        res.status(200).json({
          status: "SUCCESS",
          response
        });
      });
    } else {
      res.send({
        status: "NOT_FOUND",
        message: "Updates Not Found"
      });
    }
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.message
    });
  }
};
