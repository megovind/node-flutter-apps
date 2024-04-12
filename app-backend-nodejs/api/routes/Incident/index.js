const passport = require("passport");
const express = require("express");
const router = express.Router();

const incidentController = require("../../controllers/Incident");

router.post(
  "/register-incident",
  passport.authenticate("jwt", { session: false }),
  incidentController.registerIncident
);

// to updates incident updates
router.post(
  "/incident-updates/:id/:incidentId",
  passport.authenticate("jwt", { session: false }),
  incidentController.incidentUpdates
);

router.get(
  "/get-all-incidents",
  passport.authenticate("jwt", { session: false }),
  incidentController.getAllIncident
);

router.get(
  "/get-incident-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  incidentController.getIncidentById
);

router.get(
  "/get-incident-by-transpoter/:transpoterId",
  passport.authenticate("jwt", { session: false }),
  incidentController.getIncidentByTranspoterId
);

router.get(
  "/get-incident-by-driver/:driverId",
  passport.authenticate("jwt", { session: false }),
  incidentController.getIncidentByDriverId
);

router.get(
  "/get-open-incidents-by-representative/:representativeId",
  passport.authenticate("jwt", { session: false }),
  incidentController.getOpenIncidentsByRepresentativeId
);

// to getall incident by repId (new)
router.get(
  "/get-incidents-by-representativeId/:representativeId",
  passport.authenticate("jwt", { session: false }),
  incidentController.getIncidentsByrepresentative
);

// new api for updating the representative status
router.patch(
  "/update-representative/:incidentId",
  passport.authenticate("jwt", { session: false }),
  incidentController.updateRepresentative
);

// updating the service status
router.patch(
  "/update-service/:incidentId",
  passport.authenticate("jwt", { session: false }),
  incidentController.updateService
);

// close incident
router.patch(
  "/complete-incident/:incidentId",
  passport.authenticate("jwt", { session: false }),
  incidentController.completeIncident
);

router.patch(
  "/update-Incident-images-by-id/:incidentId",
  passport.authenticate("jwt", { session: false }),
  incidentController.updateIncidentImagesById
);

router.patch(
  "/update-incident-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  incidentController.updateIncidentById
);

// Utilities

router.patch("/update-truckId", incidentController.updateTruckIdInIncident);

router.patch(
  "/move-logsin-updates",
  incidentController.updateIncidentUpdatesLogs
);

module.exports = router;
