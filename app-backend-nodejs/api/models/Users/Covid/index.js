const mongoose = require("mongoose");

const ngoDataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    phone: { type: Number, default: null },
    type: { type: String, default: null },
    needed_help: { type: String, default: null },
    location: {
        address: String,
        lat: String,
        lng: String,
        cityName: String,
        stateName: String,
        country: String,
        zipcode: String,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("NgoData", ngoDataSchema);

