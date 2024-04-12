const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    chargePerTruckPerMonth: Number,
    numberOfTruck: Number,
    numberOfMonth: Number,
    totalAmount: Number,
    startDate: Date,
    endDate: Date,
    noOfSubscriopton: Number,
    inSubscripiton: { type: Boolean, default: false },
    isTrialDone: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model("subscription", subscriptionSchema);