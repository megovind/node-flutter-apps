const mongoose = require("mongoose");

const representativeSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: String,
  signInTime: Date,
  signOutTime: { type: Date, default: null },
  signInLocation: Array, //location will have address, lat, lang
  signOutLoaction: Array, //same to start
  distanceTravelled: Number, //distance between start and end location
  updates: Array,
  logs: Array, //will have _id, comment, datetime
  images: Array,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RepersentativeUpdates", representativeSchema);
