// const _ = require("lodash");
// const webpush = require("web-push");
// const admin = require("firebase-admin");
// const User = require("../models/Users");
// const ServiceProvider = require("../models/ServiceProvider");

// var serviceAccount = require("./../../serviceAccount.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://root-32de2.firebaseio.com"
// });

// const sendNotifications = async (token, title, message) => {
//   let registrationToken = token;
//   let payload = {
//     notification: {
//       title: title,
//       body: message,
//       image: "http://localhost:3000/images/icon.png"
//     }
//   };

//   let options = {
//     priority: "high",
//     timeToLive: 60 * 60
//   };

//   let response = await admin
//     .messaging()
//     .sendToDevice(registrationToken, payload, options);
//   return response;
// };

// exports.updateNotificationToken = async (req, res, next) => {
//   const appName = req.params.appName; //'root_app, root_agent, root_driver, root_partner, root_crm';
//   const userId = req.params.userId;
//   let updateToken;
//   try {
//     switch (appName) {
//       case "root_app":
//         updateToken = await User.findByIdAndUpdate(
//           { _id: userId },
//           { $set: { transporterFcmToken: req.body.token } },
//           { new: true }
//         );
//         break;
//       case "root_agent":
//         updateToken = await User.findByIdAndUpdate(
//           { _id: userId },
//           { $set: { agentFcmToken: req.body.token } },
//           { new: true }
//         );
//         break;
//       case "root_driver":
//         updateToken = await User.findByIdAndUpdate(
//           { _id: userId },
//           { $set: { driverFcmToken: req.body.token } },
//           { new: true }
//         );
//         break;
//       case "root_crm":
//         updateToken = await User.findByIdAndUpdate(
//           { _id: userId },
//           { $set: { webFcmToken: req.body.token } },
//           { new: true }
//         );
//         break;
//       case "root_partner":
//         updateToken = await ServiceProvider.findByIdAndUpdate(
//           { _id: userId },
//           { $set: { partnerFcmToken: req.body.token } },
//           { new: true }
//         );
//         break;
//       default:
//         break;
//     }
//     if (!_.isEmpty(updateToken)) {
//       res.send({ status: "SUCCESS", updateToken });
//     } else {
//       res.send({ status: "ERROR", message: "User Not Found" });
//     }
//   } catch (error) {
//     res.send({ status: "ERROR", message: error.message });
//   }
// };

// exports.subscribePlatform = (req, res, next) => {
//   const subscription = req.body;
//   console.log(subscription);
//   const payload = JSON.stringify({
//     title: "Hello!",
//     body: "It works."
//   });

//   webpush
//     .sendNotification(subscription, payload)
//     .then(result => console.log(result))
//     .catch(e => console.log(e.stack));

//   res.status(200).json({ success: true });
// };
