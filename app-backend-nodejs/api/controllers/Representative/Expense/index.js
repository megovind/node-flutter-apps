const _ = require("lodash");
const mongoose = require("mongoose");
const RepresentativeExpense = require("../../../models/representative/Expense");

exports.addRepExpense = async (req, res, next) => {
  try {
    const repExpense = new RepresentativeExpense({
      _id: mongoose.Types.ObjectId(),
      userId: req.body.userId,
      expense: req.body.expense,
      amount: req.body.amount,
      imageUrl: req.body.imageUrl,
      description: req.body.description
    });

    const response = await repExpense.save();
    return res.send({
      status: "SUCCESS",
      message: "Expnese has been added",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getAllVerifiedExpenseByUserId = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.find({
      $and: [{ userId: req.params.userId }, { isVerified: true }]
    })
      .select(
        "_id userId expense amount imageUrl description isVerified verifier"
      )
      .exec();
    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "Expense not found" });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getAllNotVerifiedExpenseByUserId = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.find({
      $and: [{ userId: req.params.userId }, { isVerified: false }]
    })
      .select(
        "_id userId expense amount imageUrl description isVerified verifier"
      )
      .exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Expense Not found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.findById({
      _id: req.params.id
    }).exec();
    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "Expense not found" });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getExpenseByUserId = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.find({
      userId: req.params.userId
    }).exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Expense not found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.deleteOne({
      _id: req.params.id
    }).exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        response
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.verifyExpense = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.updateOne(
      { _id: req.params.id },
      { $set: { isVerified: true, verifier: req.body.userId } },
      { new: true }
    ).exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Expense not found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.messag
    });
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const updateExpense = new RepresentativeExpense({
      expense: req.body.expense,
      amount: req.body.amount,
      imageUrl: req.body.imageUrl,
      description: req.body.description
    });

    const response = await RepresentativeExpense.updateOne(
      { $and: [{ _id: req.params.id }, { isVerified: false }] },
      { $set: updateExpense }
    ).exec();

    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Not Found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (err) {
    return res.send({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const response = await RepresentativeExpense.find()
      .select(
        "_id userId expense amount imageUrl description isVerified verifier"
      )
      .exec();
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Expenses not found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};
