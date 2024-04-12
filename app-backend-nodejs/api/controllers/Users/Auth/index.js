const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const User = require("../../../models/Users");
const Otp = require("../../../models/OTP");
const sendSms = require("../../../utilities/send-sms").sendMsg;
const sendOtp = require("../../../utilities/send-otp").sendOtp;

//check the user exists in user table or not
const findUser = async query => {
  const user = await User.findOne(query).exec();
  return user;
};

//to signup
exports.signup = (req, res, next) => {
  // checking user already exists or not
  User.findOne({ $and: [{ phone: req.body.phone }, { type: req.body.type }] })
    .exec()
    .then(async user => {
      //user exists and isDeleted = true
      if (!_.isEmpty(user) && user.isDeleted) {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              isDeleted: false,
              name: req.body.name,
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
        // after registration, send otp to user for verify otp
        sendOtp(user, (error, result) => {
          res.send({
            status: "SUCCESS",
            message: "Signup Successfully",
            response: {
              regId: result._id,
              userId: user._id,
              phone: user.phone,
              type: user.type,
              name: user.name,
              location: user.location,
              inTrial: user.inTrial,
              isTrialDone: user.isTrialDone,
              trialStartDate: user.trialStartDate,
              trialEndDate: user.trialEndDate,
              created_by: user.created_by
            }
          });
        });
        //send welcome message
        if (req.body.type === "transporter") {
          const msg = process.env.WELCOMEHINDIMSG;
          sendSms([req.body.phone], msg);
        }
      }
      // user already exists, and isDeleted=false
      else if (!_.isEmpty(user) && !user.isDeleted) {
        return res.send({
          status: "ALREADY_EXITS",
          message: "Already Registered. Want To Login?"
        });
      } else {
        // if user not exists, save the user object in db.
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          phone: req.body.phone,
          type: req.body.type,
          name: req.body.name,
          location: {
            address: req.body.address,
            lat: req.body.lat,
            lng: req.body.lng,
            cityName: req.body.cityName,
            stateName: req.body.stateName
          },
          created_by:
            req.body.hasOwnProperty("created_by") && req.body.created_by !== ""
              ? req.body.created_by
              : null,
          acceptTerms: req.body.acceptTerms,
          isDeleted: false
        });
        user
          .save()
          .then(response => {
            // after registration, send otp to user for verify otp
            sendOtp(response, (error, result) => {
              res.send({
                status: "SUCCESS",
                message: "Signup Successfully",
                response: {
                  _id: response._id,
                  regId: result._id,
                  phone: response.phone,
                  type: response.type,
                  name: response.name,
                  location: response.location,
                  inTrial: response.inTrial,
                  isTrialDone: response.isTrialDone,
                  trialStartDate: response.trialStartDate,
                  trialEndDate: response.trialEndDate,
                  created_by: response.created_by
                }
              });
            });
          })
          .then(response => {
            //send welcome message
            if (req.body.type === "transporter") {
              const msg = process.env.WELCOMEHINDIMSG;
              sendSms([req.body.phone], msg);
            }
          })
          .catch(err => {
            return res.send({
              status: "ERROR",
              message: err.message
            });
          });
      }
    });
};

// Login controller
exports.Login = async (req, res, next) => {
  try {

    let query = {};

    if (req.query.type) {
      // check type is exists
      query = {
        $and: [
          { phone: req.body.phone },
          { type: req.query.type },
        ]
      };
    } else {
      query = {
        $and: [{ phone: req.body.phone }, { isDeleted: false }]
      };
    }


    let response = await findUser(query);

    if (_.isEmpty(response)) {
      if (req.query.type === "driver") {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          phone: req.body.phone,
          type: req.body.type,
          name: "New Driver",
          location: {
            address: req.body.address,
            lat: req.body.lat,
            lng: req.body.lng,
            cityName: req.body.cityName,
            stateName: req.body.stateName,
            country: req.body.country,
            zipcode: req.body.zipcode
          },
          created_by:
            req.body.hasOwnProperty("created_by") && req.body.created_by !== ""
              ? req.body.created_by
              : null,
          acceptTerms: true,
          isDeleted: false
        });
        response = await user.save();
      } else {
        return res.send({
          status: "NOT_FOUND",
          message: "Not Registered User. Want To Register?"
        });
      }
    }
    // if user exists, send otp for verification
    sendOtp(response, (error, result) => {
      response = JSON.parse(JSON.stringify(response));
      response.regId = result._id;
      return res.send({
        status: "SUCCESS",
        message: "Login Successfull",
        response
      });
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// Verify otp
exports.Verify_Otp = async (req, res, next) => {
  try {
    let otp = await Otp.findOneAndUpdate(
      {
        $and: [
          { _id: req.body._id },
          { status: "0" },
          { code: req.body.code },
          { userId: req.body.userId }
        ]
      },
      { $set: { status: 1 } },
      { new: true }
    ).exec();
    if (!_.isEmpty(otp)) {
      otp = JSON.parse(JSON.stringify(otp));
      const token = jwt.sign(
        { phone: otp.phone, userId: otp.userId },
        process.env.secretKey
      );
      otp.access_token = token;
      await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { logged_in: "Yes" } })
      return res.send({
        status: "SUCCESS",
        message: "Login Successful",
        response: otp
      });
    } else {
      return res.send({
        status: "WRONGOTP",
        message: "Please Enter Correct OTP"
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};
