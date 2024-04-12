const passport = require("passport");
const express = require("express");
const router = express.Router();

const transporterController = require("../../controllers/Transporter");

router.get(
  "/get-all-transporter",
  passport.authenticate("jwt", { session: false }),
  transporterController.getAllTransporter
);

router.patch(
  "/update-transporter/:id",
  passport.authenticate("jwt", { session: false }),
  transporterController.updateTransporter
);

module.exports = router;
