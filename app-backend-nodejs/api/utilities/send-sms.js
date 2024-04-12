const _ = require("lodash");
const http = require("https");
const twilio = require("twilio");

const Truck = require("../models/Truck");
const User = require("../models/Users");
const staticMsg = require("../static-messages/message");

// Sending SMS , while sharing the location from driver to Transpoter and Admin
exports.sendSMS = (req, res, next) => {
  let message = "";

  if (!_.isEmpty(req.body)) {
    const URL = `https://maps.google.com/?q=${req.body.latitude},${req.body.langitude}`;
    const mobileNumber = [];
    Truck.find({ regNo: req.body.truckNum })
      .exec()
      .then(truck => {
        if (!_.isEmpty(truck)) {
          User.find({ _id: truck[0].ownerId })
            .exec()
            .then(user => {
              if (!_.isEmpty(user)) {
                mobileNumber.push(
                  req.body.phone,
                  process.env.adminMobileNumber
                );
                message = `${staticMsg.truckLocation} ${URL}. ${staticMsg.truckNumber} : ${req.body.truckNum}.${staticMsg.driverNumber} ${req.body.phone}`;
                if (process.env.NODE_ENV !== "development") {
                  this.sendMsg(mobileNumber, message);
                }
                res.status(200).json({
                  status: "SUCCESS",
                  message: "Location shared with Admin and Transporter"
                });
              }
            });
        } else {
          mobileNumber.push(process.env.adminMobileNumber);
          message = `${staticMsg.truckLocation} ${URL}. ${staticMsg.truckNumber} : ${req.body.truckNum}.${staticMsg.driverNumber} ${req.body.phone}`;
          if (process.env.NODE_ENV !== "development") {
            this.sendMsg(mobileNumber, message);
          }
          res.status(200).json({
            status: "SUCCESS",
            message: "Location shared with Admin"
          });
        }
      });
  }
};

// sending transactional SMS's
exports.sendMsg = (mobileNumber, message) => {
  console.log(mobileNumber);
  console.log(message);


  let options = {
    method: "POST",
    hostname: "api.msg91.com",
    port: null,
    path: "/api/v2/sendsms?country=91",
    headers: {
      authkey: process.env.authKey,
      "content-type": "application/json"
    }
  };
  if (process.env.NODE_ENV !== "development") {
    let reqs = http.request(options, function (res) {
      let chunks = [];
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
      res.on("end", function () {
        let body = Buffer.concat(chunks);
      });
    });
    reqs.write(
      JSON.stringify({
        sender: process.env.sender,
        route: "4",
        country: "91",
        unicode: "1",
        sms: [{ message: `${message}`, to: mobileNumber }]
      })
    );
    reqs.end();
  }
};

//send promotional messages like tell customer about doc expiring
exports.promoMsg = (mobileNumber, message) => {
  let options = {
    method: "POST",
    hostname: "api.msg91.com",
    port: null,
    path: "/api/v2/sendsms?country=91",
    headers: {
      authkey: process.env.authKey,
      "content-type": "application/json"
    }
  };
  let reqs = http.request(options, function (res) {
    let chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
    res.on("end", function () {
      let body = Buffer.concat(chunks);
    });
  });
  reqs.write(
    JSON.stringify({
      sender: process.env.sender,
      route: "1",
      country: "91",
      unicode: "1",
      sms: [{ message: `${message}`, to: mobileNumber }]
    })
  );
  reqs.end();
};

// const sendWhatAppMsg = () => {
//     const accountSid = 'AC69a3c0872f9192ad3b2488276010f6d7';
//     const authToken = '7706d8b120a8ddde352c1574b772024e';
//     const client = new twilio(accountSid, authToken);

//     client.messages
//         .create({
//             from: 'whatsapp:+14155238886',
//             body: 'Hello there!',
//             to: 'whatsapp:+918559865832'
//         })
//         .then(message => {
//             console.log("Message");
//             console.log(message)
//         }
//         ).catch((error) => {
//             console.log("Error");
//             console.log(error);
//         });
// }
