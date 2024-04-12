const express = require("express");
const router = express.Router();

const contactController = require("../../controllers/Contacts");

// it was getting used in the old website to store contact info of the users who will try to contact us.
// not getting used anymore so no use of this
router.post(
  "/contact-information-stored-from-wesite",
  contactController.contactInfoFromWebsite
);

router.get("/get-all-cities-state-wise", contactController.getServicesState);

router.get(
  "/get-services-by-cities/:city_name",
  contactController.getServicesByCity
);

module.exports = router;
