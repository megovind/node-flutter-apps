const mongoose = require("mongoose");

const serviceProviderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  location: {
    address: String,
    lat: String,
    lng: String,
    cityName: String,
    stateName: String
  },
  type: { type: String, required: true },
  isDeleted: { type: Boolean },
  firmName: { type: String },
  acceptTerms: Boolean,
  partnerFcmToken: { type: String, default: null },
  created_by: String,
  update_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("serviceProvider", serviceProviderSchema);
