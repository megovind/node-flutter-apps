const passport = require("passport");
const express = require("express");
const router = express.Router();

const dashboardDataController = require("../../controllers/Dashboard/index");
const AuthCheck = require("../../middleware/check-auth");

router.get(
  "/get-dashboard-data",
  passport.authenticate("jwt", { session: false }),
  dashboardDataController.incidentStatistics
);

module.exports = router;
