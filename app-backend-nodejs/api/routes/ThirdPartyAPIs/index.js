const passport = require("passport");
const express = require("express");
const router = express.Router();

const APIController = require("../../controllers/ThirdPartyAPLs");

router.get(
    "/fetch-referrels",
    passport.authenticate("jwt", { session: false }),
    APIController.fetch_referrels
);

router.post(
    "/register-incident",
    APIController.create_incident_by_referrel
)

router.post(
    "/add-referrel-api-key",
    passport.authenticate("jwt", { session: false }),
    APIController.manage_api_access
);

router.patch(
    "/update-referrel-api-key",
    passport.authenticate("jwt", { session: false }),
    APIController.update_api_access
);

module.exports = router;