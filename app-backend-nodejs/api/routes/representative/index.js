const passport = require("passport");
const express = require("express");
const router = express.Router();

const representativeController = require("../../controllers/Representative");

router.post(
  "/add-representative",
  passport.authenticate("jwt", { session: false }),
  representativeController.addRepresentative
);

// This api will be used to invite people by the representative
router.post(
  "/invite-people/:type/:transporter/:user",
  representativeController.invitePeople
);

router.get(
  "/get-representative-by-createdBy/:id",
  passport.authenticate("jwt", { session: false }),
  representativeController.getRepresentativeByCreatedBy
);

router.get(
  "/get-all-representative",
  passport.authenticate("jwt", { session: false }),
  representativeController.getAllRepresentative
);

router.put(
  "/update-representative",
  passport.authenticate("jwt", { session: false }),
  representativeController.updateRepresentative
);

router.patch(
  "/delete-representative/:repId",
  passport.authenticate("jwt", { session: false }),
  representativeController.deleteRepresentativeById
);

router.post(
  "/update-agent-status/:id",
  passport.authenticate("jwt", { session: false }),
  representativeController.changeAgentStatus
);

module.exports = router;
