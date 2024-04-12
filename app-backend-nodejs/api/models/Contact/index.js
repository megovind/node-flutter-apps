const mongoose = require("mongoose");

const contactFromWebsite = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, default: null },
  email: { type: String, default: null },
  subject: { type: String, default: null },
  message: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ContactedUsers", contactFromWebsite);
