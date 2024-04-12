const mongoose = require("mongoose");

const incidentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  caseId: { type: String },
  status: { type: String, default: "open" },
  truck: { type: String, ref: "Truck" },
  truckRegNo: { type: String },
  owner: { type: String, ref: "User" },
  representative: [{ type: String, ref: "User" }],
  service: [{ type: String, ref: "Service" }],
  driver: { type: String, ref: "User" },
  specialization: [{ type: String, ref: "Specialization" }],
  payment: { type: String, default: null, ref: "IncidentPayment" },
  paymentRequest: { type: Boolean, default: false },
  updates: { type: String, ref: "IncidentsUpdates" },
  availServices: [{ type: String, ref: "Service" }],
  availRepesentative: [{ type: String, ref: "User" }],
  location: {
    address: String,
    lat: String,
    lng: String,
    cityName: String,
    stateName: String
  },
  images: { type: Array },
  paymentStatus: String,
  description: String,
  source: { type: String, default: "Root" },
  createdBy: String,
  isFeedbackDone: { type: Boolean, default: false },
  closed_at: { type: Date, default: Date.now },
  completedAt: { type: Date, default: Date.now },
  paymentDoneAt: { type: Date, default: Date.now },
  paymentUpdatedAt: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Incidents", incidentSchema);
