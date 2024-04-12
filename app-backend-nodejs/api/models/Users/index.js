const mongoose = require("mongoose");

const userSignupSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: { type: String, default: null },
  phone: { type: Number, required: true },
  image: { type: String, default: null },
  organization: { type: String, default: null, ref: "Organization" },
  verified: { type: Boolean, default: false },
  logged_in: { type: String, default: "No" },
  needed_help: { type: String, default: null },
  location: {
    address: { type: String, default: null },
    lat: { type: String, default: null },
    lng: { type: String, default: null },
    cityName: { type: String, default: null },
    stateName: { type: String, default: null },
    country: { type: String, default: null },
    zipcode: { type: String, default: null }
  },
  uid: { type: String, default: null },
  gstIn: { type: String, default: null },
  panNumber: { type: String, default: null },
  type: { type: String, required: true },
  acceptTerms: { type: Boolean, default: false },
  inTrial: { type: Boolean, default: false },
  isTrialDone: { type: Boolean, default: false },
  trialStartDate: { type: Date, default: null },
  trialEndDate: { type: Date, default: null },
  webFcmToken: { type: String, default: null },
  driverFcmToken: { type: String, default: null },
  transporterFcmToken: { type: String, default: null },
  agentFcmToken: { type: String, default: null },
  firmName: { type: String, default: null },
  partnerFcmToken: { type: String, default: null },
  dl_image: { type: String, default: null },
  created_by: String,
  updated_by: String,
  isDeleted: Boolean,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSignupSchema);
