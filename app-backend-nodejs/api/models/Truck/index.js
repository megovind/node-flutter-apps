const mongoose = require("mongoose");

const truckSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  truckModel: { type: String, default: null },
  regNo: { type: String, required: true },
  manufacturer: { type: String, default: null },
  manufacturingDate: { type: Date, default: null },
  organization: { type: String, default: null, ref: "Organization" },
  owner: { type: String, required: true, ref: "User" },
  driver: { type: String, default: null, ref: "User" },
  oldDrivers: [{ type: String, ref: "User" }],
  rcImage: { type: String, default: null },
  documents: [{ type: String, ref: "TruckDocument" }],
  location: {
    address: String,
    lat: String,
    lng: String,
    cityName: String,
    stateName: String
  },
  incidents: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Truck", truckSchema);
