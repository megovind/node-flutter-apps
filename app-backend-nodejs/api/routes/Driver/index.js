const passport = require("passport");
const express = require("express");
const router = express.Router();

const driverController = require("../../controllers/Driver");

router.get(
  "/get-all-drivers",
  passport.authenticate("jwt", { session: false }),
  driverController.getAllDrivers
);

module.exports = router;
