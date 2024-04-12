const mongoose = require("mongoose");
const http = require("https");
const _ = require("lodash");
var qs = require("querystring");

const Otp = require("../models/OTP");

const fourDigitCode = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

exports.sendOtp = (data, callback) => {
  const otp = fourDigitCode();
  const otpMsg = encodeURI(`Your Root OTP is ${otp}`);
  let options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: `/api/sendotp.php?otp=${otp}&otp_length=4&otp_expiry=1&sender=${process.env.sender}&message=${otpMsg}&mobile=${data.phone}&authkey=${process.env.authKey}`,
    headers: {}
  };
  if (process.env.NODE_ENV !== "development") {
    let req = http.request(options, function(res) {
      let chunks = [];

      res.on("data", function(chunk) {
        chunks.push(chunk);
      });

      res.on("end", function() {
        let body = Buffer.concat(chunks);
      });
    });

    req.end();
  }
  const OTP = new Otp({
    _id: new mongoose.Types.ObjectId(),
    userId: data._id,
    code: otp,
    status: 0,
    phone: data.phone,
    type: data.type
  });
  OTP.save().then(result => {
    callback(null, result);
  });
};

exports.verifyOtpFromExternalApi = (data, callback) => {
  let message = "";
  let options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: `/api/verifyRequestOTP.php?authkey=${process.env.authKey}&mobile=${data.phone}&otp=${data.code}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    }
  };

  let req = http.request(options, function(res) {
    let chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
    });
    res.on("end", async function() {
      let body = await Buffer.concat(chunks);
    });
    req.write(qs.stringify({}));
    req.end();
    callback(null, message);
  });
};
