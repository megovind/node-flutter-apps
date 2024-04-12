const mongoose = require("mongoose");
const _ = require("lodash");

const User = require("../../models/Users");
const SubScription = require("../../models/subscription");

exports.addSubScription = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    let user = await User.findOne({ _id: userId }).exec();
    if (!_.isEmpty(user)) {
      if (!user.inTrial) {
        await User.updateOne(
          { _id: userId },
          {
            $set: {
              inTrial: true,
              trialStartDate: req.body.trialStartDate,
              trialEndDate: req.body.trialStartDate
            }
          }
        ).exec();
      }
      const subscription = new SubScription({
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        chargePerTruckPerMonth: req.body.chargePerTruckPerMonth,
        numberOfTruck: req.body.numberOfTruck,
        numberOfMonth: req.body.numberOfMonth,
        totalAmount: req.body.totalAmount,
        startDate: req.body.startDate,
        endDate: req.body.endDate
      });
      let response = await subscription.save();
      return res.status(200).json({
        status: "SUCCESS",
        message: "subcription has been added succefully",
        response: response
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "INTERNAL_ERROR",
      message: err.message
    });
  }
};

exports.getSubscription = (req, res, next) => {
  const userId = req.params.userId;
  SubScription.findOne({ $and: [{ userId: userId }, { isTrialDone: false }] })
    .exec()
    .then(response => {
      res.status(200).json({
        status: "SUCCESS",
        response
      });
    })
    .catch(error => {
      res.status(500).json({
        status: "INTERNAL_SERVER",
        message: error.message
      });
    });
};
