const passport = require("passport");
const express = require("express");
const router = express.Router();

const truckController = require("../../controllers/Truck");
const documentController = require("../../controllers/Truck/Document");

//to search item
router.get(
  "/search-truck/:query",
  passport.authenticate("jwt", { session: false }),
  truckController.searchTruck
);

router.post(
  "/add-truck",
  passport.authenticate("jwt", { session: false }),
  truckController.addTruck
);

router.get(
  "/get-truck-by-id/:truckId",
  // passport.authenticate("jwt", { session: false }),
  truckController.getTruckById
);

router.get(
  "/get-trucks-by-owner/:userId",
  passport.authenticate("jwt", { session: false }),
  truckController.getTruckByOwnerId
);

//used in crm
//  used in feching drivers by ownerId
router.get(
  "/get-truck/:userId",
  passport.authenticate("jwt", { session: false }),
  truckController.getTruckByOwnerId
);

// new one get trucks with pagination
router.get(
  "/get-trucks",
  passport.authenticate("jwt", { session: false }),
  truckController.getTrucks
);

router.post(
  "/add-truck-documents/:truckId",
  passport.authenticate("jwt", { session: false }),
  documentController.addTruckDocuments
);

router.patch(
  "/update-truck-docs/:truckId/:docId",
  passport.authenticate("jwt", { session: false }),
  documentController.updateTruckDocs
);

router.patch(
  "/update-truck-location/:truckId",
  passport.authenticate("jwt", { session: false }),
  truckController.updateTruckLocation
);

router.patch(
  "/update-truck-details/:truckId",
  // passport.authenticate("jwt", { session: false }),
  truckController.updateTruckDetails
);

// not using
router.delete(
  "/delete-truck/:truckId",
  passport.authenticate("jwt", { session: false }),
  truckController.deleteTruck
);

router.get(
  "/get-trucks-driver/:driverId",
  // passport.authenticate("jwt", { session: false }),
  truckController.getTruckByDriverId
);

router.delete(
  "/remove-driver/:truckId/:driverId",
  passport.authenticate("jwt", { session: false }),
  truckController.deleteDriverFromTruck
);

router.patch("/update-incident-count", truckController.updateIncidentCount);

module.exports = router;
