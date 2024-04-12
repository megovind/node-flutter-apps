const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  registrationNumber: { type: String, default: null },
  name: { type: String },
  phone: { type: Number, require: true },
  serviceType: String,
  capacity: { type: Number, default: 0 },
  ownerNumber: { type: Number, require: true },
  unit: { type: String, default: "Tons" },
  location: {
    address: { type: String },
    lat: String,
    lng: String,
    stateName: { type: String },
    cityName: { type: String }
  },
  specialization: [{ type: String, ref: "Specialization" }],
  incidents: { type: Number, default: 0 },
  image: String,
  created_by: { type: String, ref: "User" },
  updated_by: String,
  isDeleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Service", serviceSchema);
