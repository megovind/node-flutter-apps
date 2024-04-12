const mongoose = require('mongoose');

const referralSourceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    referral_source: { type: String, default: null },
    restricted_to: { type: Array, default: null },
    platform_packages: { type: Array, default: null },
    api_key: { type: String, default: null },
})

module.exports = mongoose.model("ReferralSources", referralSourceSchema);