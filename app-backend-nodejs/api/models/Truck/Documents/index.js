const mongoose = require('mongoose');

const truckDocumentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: { type: String },
    url: { type: String },
    expiryDate: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TruckDocument', truckDocumentSchema);