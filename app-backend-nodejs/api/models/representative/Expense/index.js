const mongoose = require('mongoose');

const repExpenseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    expense: { type: String, required: true },
    amount: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    verifier: String,
    imageUrl: String,
    description: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('RepresentativeExpense', repExpenseSchema);