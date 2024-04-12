const mongoose = require("mongoose");

const organizationSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, default: null },
  owner: { type: String, default: null },
  location: { type: Object, default: null },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Organization", organizationSchema);
