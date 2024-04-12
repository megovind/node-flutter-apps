const mongoose = require("mongoose");

const tripsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  truck: { type: String, default: null, ref: "Truck" },
  owner: { type: String, required: true, ref: "User" },
  driver: { type: String, default: null, ref: "User" },
  trip_status: { type: String, default: "yet to start" },
  source_location: { type: String, default: null },
  destination_location: { type: String, default: null },
  trip_start_date: { type: Date, default: null },
  trip_end_date: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trips", tripsSchema);
