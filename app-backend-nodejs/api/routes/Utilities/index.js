const passport = require("passport");
const express = require("express");
const router = express.Router();

const sendSMS = require("../../utilities/send-sms");
const amazonS3 = require("../../utilities/amazonS3");
// const pushNotification = require("../../utility/push-notifications");
const AuthCheck = require("../../middleware/check-auth");
const contactMail = require("../../utilities/email-service");

router.post(
  "/sendsms",
  passport.authenticate("jwt", { session: false }),
  sendSMS.sendSMS
);

router.post(
  "/uploadFileToAws",
  passport.authenticate("jwt", { session: false }),
  amazonS3.uploadToS3
);

// router.post("/subscribe", pushNotification.subscribePlatform);

router.post("/contact-mail", contactMail.mailService);

// router.post(
//   "/save-notification-token/:appName/:userId",
//   passport.authenticate("jwt", { session: false }),
//   pushNotification.updateNotificationToken
// );

module.exports = router;
