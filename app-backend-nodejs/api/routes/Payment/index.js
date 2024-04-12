const passport = require("passport");
const express = require("express");
const router = express.Router();

const incidentPaymentDetailsController = require("../../controllers/Payment");

//to add incident payment datails
router.post(
  "/add-incident-paymnet-details/:incidentId/:userId",
  passport.authenticate("jwt", { session: false }),
  incidentPaymentDetailsController.incidentPaymentDetails
);

//to get payment reports
router.get(
  "/get-incident-payment-report/:start_date/:end_date/:all",
  passport.authenticate("jwt", { session: false }),
  incidentPaymentDetailsController.payemtReports
);

module.exports = router;
