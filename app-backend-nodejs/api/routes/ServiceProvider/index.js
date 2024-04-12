const passport = require("passport");
const express = require("express");
const router = express.Router();

const serviceProviderController = require("../../controllers/ServiceProvider");

// service provider signup was there before but it was moved to users later on so no use of this

router.post(
  "/service-provider-signup",
  serviceProviderController.serviceProviderSignUp
);

router.post(
  "/copy-serviceProvider-to-user",
  serviceProviderController.copyServiceProviderToUser
);

router.post(
  "/service-provider-login",
  serviceProviderController.serviceProviderLogin
);

router.get(
  "/get-all-service-provider",
  passport.authenticate("jwt", { session: false }),
  serviceProviderController.getAllServiceProvider
);

router.get(
  "/get-service-provider/:id",
  passport.authenticate("jwt", { session: false }),
  serviceProviderController.getServiceProviderById
);

router.get(
  "/get-service-provider-by-createdBy/:id",
  passport.authenticate("jwt", { session: false }),
  serviceProviderController.getServiceProviderByCreatedBy
);

router.patch(
  "/update-service-provider/:id",
  passport.authenticate("jwt", { session: false }),
  serviceProviderController.updateServiceProvider
);

router.delete(
  "/delete-service-provider/:id",
  passport.authenticate("jwt", { session: false }),
  serviceProviderController.deleteServiceProvider
);

module.exports = router;
