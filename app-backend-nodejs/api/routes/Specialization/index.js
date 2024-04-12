const passport = require("passport");
const express = require("express");
const router = express.Router();

const specializationController = require("../../controllers/Specialization");

router.post("/add-specialization", specializationController.addSpecialization);

router.get(
  "/get-all-specialization",
  // passport.authenticate("jwt", { session: false }),
  specializationController.getAllSpecialization
);

module.exports = router;
