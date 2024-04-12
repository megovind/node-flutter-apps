const _ = require('lodash');
const mongoose = require('mongoose');
const FeedbackTypes = require('../../models/feedback-types');
const Feedback = require('../../models/feedback');

exports.feedbcakFromUser = (req, res, next) => {
    const feedback = new Feedback({
        _id: new mongoose.Types.ObjectId(),
        issue_id: req.body.issueId,
        provider_id: req.body.provider_id,
        mechanic: {
            feedback_one_id: req.body.mechanic_one_id,
            answer_for_one: req.body.answer_for_one,
            feedback_two_id: req.body.mechanic_two_id,
            answer_for_two: req.body.answer_for_two,
            feedback_three_id: req.body.mechanic_three_id,
            answer_for_three: req.body.answer_for_three
        },
        crane: {
            feedback_one_id: req.body.crane_one_id,
            answer_for_one: req.body.answer_for_one,
            feedback_two_id: req.body.crane_two_id,
            answer_for_two: req.body.answer_for_two,
            feedback_three_id: req.body.crane_three_id,
            answer_for_three: req.body.answer_for_three
        },
        representative: {
            feedback_one_id: req.body.root_one_id,
            answer_for_one: req.body.answer_for_one,
            feedback_two_id: req.body.root_two_id,
            answer_for_two: req.body.answer_for_two,
            feedback_three_id: req.body.root_three_id,
            answer_for_three: req.body.answer_for_three
        }

    });
    feedback.save()
        .then(response => {
            res.status().json({
                status: 'SUCCESS',
                message: 'Feedback is done!',
                response
            }).catch(err => {
                res.status(500).json({
                    status: 'ERROR',
                    message: err.message
                })
            });
        })
}
exports.getFeedbackbyIssueId = (req, res, next) => {
    feedback.find({ issue_id: req.params.issue_id })
        .exec()
        .then(response => {
            res.status(200).json({
                status: 'SUCCESS',
                response
            })
        })
        .catch(err => {
            res.status(500).json({
                status: 'ERROR',
                message: err.message
            })
        });
}


exports.addFeedbackTypes = (req, res, next) => {
    const feedbackTypes = new FeedbackTypes({
        _id: new mongoose.Types.ObjectId(),
        type: req.body.type,
        image: req.body.image
    })
    feedbackTypes.save().then((response) => {
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Feedback Type added succefully',
            response
        })
    }).catch(err => {
        res.status(500).json({
            status: 'ERROR',
            message: err.message
        })
    });
}

exports.getAllFeedbackTypes = (req, res, next) => {
    FeedbackTypes.find()
        .select('_id type')
        .exec()
        .then(feedbackTypes => {
            if (!_.isEmpty(feedbackTypes)) {
                return res.status(200).json({
                    status: "SUCCESS",
                    response: feedbackTypes
                })
            } else {
                return res.status(400).json({
                    status: "NOT FOUND",
                    message: "No Issue Types Found"
                })
            }
        }).catch(error => {
            res.status(500).json({
                status: 'ERROR',
                message: error.message
            })
        })
}