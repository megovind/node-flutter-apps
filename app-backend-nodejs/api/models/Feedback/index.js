const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    issue_id: String, //it will be crane or mechanic or representative(means for root)
    provider_id: String,
    mechanic: {
        feedback_one_id: String,
        answer_for_one: String,
        feedback_two_id: String,
        answer_for_two: String,
        feedback_three_id: String,
        answer_for_three: String,
    },
    crane: {
        feedback_one_id: String,
        answer_for_one: String,
        feedback_two_id: String,
        answer_for_two: String,
        feedback_three_id: String,
        answer_for_three: String,
    },
    representative: {
        feedback_one_id: String,
        answer_for_one: String,
        feedback_two_id: String,
        answer_for_two: String,
        feedback_three_id: String,
        answer_for_three: String,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("feedback", feedbackSchema);