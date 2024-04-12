const passport = require("passport");
const express = require("express");
const router = express.Router();

const servicesController = require("../../controllers/Services");

router.post(
  "/add-services",
  passport.authenticate("jwt", { session: false }),
  servicesController.addServices
);

router.post(
  "/update-service/:id",
  passport.authenticate("jwt", { session: false }),
  servicesController.edit_service
)

//get all services
router.get(
  "/get-services",
  passport.authenticate("jwt", { session: false }),
  servicesController.getServices
);

router.get(
  "/get-services-by-createdBy/:id",
  passport.authenticate("jwt", { session: false }),
  servicesController.getServicesByCreatedBy
);

router.get(
  "/get-services-by-ownerNumber/:ownerNumber",
  passport.authenticate("jwt", { session: false }),
  servicesController.getServicesByOwnerPhoneNumber
);

router.delete(
  "/delete-service/:id",
  passport.authenticate("jwt", { session: false }),
  servicesController.deleteServiceById
);

// it was used on the website to show network
router.get(
  "/get-web-services/:host/:protocol/:isOkay",
  servicesController.getServiceForWeb
);

//initial update of incident count for the service provider
router.post(
  "/update-incident-count",
  servicesController.incidentCountInServices
);

module.exports = router;
