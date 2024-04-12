const mongoose = require("mongoose");
const _ = require("lodash");

const User = require("../../models/Users");

exports.getAllDrivers = (req, res, next) => {
  User.find({ $and: [{ isDeleted: false }, { type: "driver" }] })
    .exec()
    .then(async response => {
      if (!_.isEmpty(response)) {
        return res.status(200).json({
          status: "SUCCESS",
          response: response
        });
      }
      return res.send({
        status: "NOT_FOUND",
        message: "No Drivers Found"
      });
    })
    .catch(error => {
      res.status(500).json({
        status: "INTERNAL_SERVER",
        message: error.message
      });
    });
};
