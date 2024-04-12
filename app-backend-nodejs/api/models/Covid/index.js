const mongoose = require("mongoose");

const covidMedSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  type: { type: String, default: null },
  name: { type: String, default: null },
  contact_number: { type: String, default: null },
  available_service: { type: Object, default: null },
  is_govt: { type: String, default: null },
  is_corona_authenticated: { type: String, default: null },
  status: { type: String, default: "Active" },
  location: { type: Object, default: null },
  description: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CovidInfo", covidMedSchema);
