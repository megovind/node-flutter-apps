const passport = require("passport");
const express = require("express");
const router = express.Router();

const subScriptionController = require("../../controllers/Subscription");

router.post(
  "/add-subscription/:userId",
  passport.authenticate("jwt", { session: false }),
  subScriptionController.addSubScription
);
router.get(
  "/get-subscription/:userId",
  passport.authenticate("jwt", { session: false }),
  subScriptionController.getSubscription
);

module.exports = router;
