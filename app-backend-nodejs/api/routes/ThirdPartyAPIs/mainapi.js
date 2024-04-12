const passport = require("passport");
const express = require("express");
const router = express.Router();

const APIController = require("../../controllers/ThirdPartyAPLs");

router.post(
    "/incidents/register-incident",
    APIController.create_incident_by_referrel
);

router.get(
    "/problems-type",
    APIController.fetch_problems_types
);



module.exports = router;