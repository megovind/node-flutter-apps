const passport = require("passport");
const express = require("express");
const router = express.Router();

const tripController = require("../../controllers/Trips");

router.post(
  "/add-trip",
  // passport.authenticate("jwt", { session: false }),
  tripController.addTrip
);

router.get(
  "/get-trip-by-driver/:id",
  // passport.authenticate("jwt", { session: false }),
  tripController.getTripsByDriver
);

router.get(
  "/get-trip-by-owner/:id",
  passport.authenticate("jwt", { session: false }),
  tripController.getTripsByOwner
);

router.get(
  "/get-triip-by-truck/:id",
  passport.authenticate("jwt", { session: false }),
  tripController.getTripsByTruck
);

router.get(
  "/get-trip-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  tripController.getTripById
);

module.exports = router;
