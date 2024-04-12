
const passport = require("passport");
const express = require("express");
const router = express.Router();

const covidContorller = require("../../controllers/Covid");
const ngoCovidController = require("../../controllers/Users/Covid")

//add ngo covid data
router.post(
    "/add-ngo-user",
    // passport.authenticate("jwt", {session: false}),
    ngoCovidController.registerUser
);

//update request user
router.patch(
    "/update-ngo-user/:id",
    // passport.authenticate("jwt",{session: false}),
    ngoCovidController.editRequestHelp
);


//add covid data
router.post(
    "/add-covid-info",
    // passport.authenticate("jwt", { session: false }),
    covidContorller.addInfo
);

router.get(
    "/get-all-covid-info",
    // passport.authenticate("jwt", { session: false }),
    covidContorller.getAllCovidInfo
);

router.get(
    '/get-all-covid-info-dashboard',
    passport.authenticate("jwt", { session: false }),
    covidContorller.getAllCovidInfoDashboard
);

router.patch(
    "/update-covid-info/:id",
    passport.authenticate("jwt", { session: false }),
    covidContorller.updateCovidInfo
)

router.patch(
    "/mark-active-inactive/:id",
    passport.authenticate("jwt", { session: false }),
    covidContorller.markActiveInavctive
)

module.exports = router;
