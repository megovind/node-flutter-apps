const express = require("express");
const router = express.Router();
const passport = require("passport");

//utilities controller
const utilitiesController = require("../../controllers/Users/Utilities");
//profile controller
const profileController = require("../../controllers/Users/Profile");
//Auth controller
const authController = require("../../controllers/Users/Auth");

//To signup/user registration
router.post("/sign-up", authController.signup);

//to login
router.post("/log-in", authController.Login);

//to verify otp
router.post("/verify-otp", authController.Verify_Otp);

// get user by id
router.get(
  "/get-user/:userId",
  passport.authenticate("jwt", { session: false }),
  profileController.getUser
);

//get drivers data

router.get(
  "/get-drivers-data/:start_date/:end_date/:all",
  passport.authenticate("jwt", { session: false }),
  profileController.getDriversForDashboard
);

//edit user status
router.patch("/edit-user-status/:id", passport.authenticate("jwt", { session: false }), profileController.editUserStatus);

// edit profile
router.patch(
  "/edit-user-profile/:userId",
  // passport.authenticate("jwt", { session: false }),
  profileController.editUserProfile
);

//Get service provider
router.get(
  "/get-service-provider/:userId",
  passport.authenticate("jwt", { session: false }),
  profileController.getServiceProvider
);

// new one
router.post(
  "/add-driver",
  passport.authenticate("jwt", { session: false }),
  utilitiesController.addDriver
);

//Utilities
router.patch(
  "/update-city-and-state-services",
  utilitiesController.updateCityAndStateName
);

router.post("/create-uid", utilitiesController.creationOfUserId);

router.patch(
  "/update-users-location/:userId",
  utilitiesController.updateUsersLocation
);

router.patch("/update-users", utilitiesController.updateUser);
router.patch("/update-ids", utilitiesController.updateUserId);
router.patch("/update-forNewids", utilitiesController.updateUserForNewOne);

module.exports = router;
