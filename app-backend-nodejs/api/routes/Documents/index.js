const passport = require("passport");
const express = require("express");
const router = express.Router();

const documentTypesController = require("../../controllers/DocumentsTypes");
const AuthCheck = require("../../middleware/check-auth");

router.post("/add-document-types", documentTypesController.addDocumentTypes);

router.get(
  "/get-all-document-types",
  passport.authenticate("jwt", { session: false }),
  documentTypesController.getAllDocumentTypes
);

module.exports = router;
