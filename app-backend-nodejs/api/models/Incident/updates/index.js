const mongoose = require("mongoose");

const incidentUpdatesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  incidentId: { type: String },
  incidentLogs: { type: Array },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("IncidentsUpdates", incidentUpdatesSchema);
