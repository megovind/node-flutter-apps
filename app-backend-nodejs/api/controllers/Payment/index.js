const mongoose = require("mongoose");
const _ = require("lodash");

const IncidentPayment = require("../../models/Payments");
const Incident = require("../../models/Incident");

exports.incidentPaymentDetails = async (req, res, next) => {
  const incident_id = req.params.incidentId; // here we have to id in incident also
  const user_id = req.params.userId;
  const paymentDetails = new IncidentPayment({
    _id: new mongoose.Types.ObjectId(),
    incident: incident_id,
    user: user_id,
    payment_mode: req.body.paymentMocde, //Cash, cheque, RTGS, IMPS, NEFT, NetBanking, UPI(I don't think we are using this)
    // sender_name: req.body.senderName,
    sender_ac_number: req.body.senderAcNumber,
    // reciever_name: req.body.recieverName,
    // reciever_ac_number: req.body.recieverAcNumber,
    senders_bank: req.body.senderBank,
    sender_ifsc: req.body.Ifsc,
    amount_in_words: req.body.amountInWords,
    amount_in_decimal: req.body.amountInDecimal,
    invoice_raised_on: req.body.raisedOn,
    transaction_id: req.body.transactionId,
    // place_of_billing: req.body.placeOfBilling,
    // place_of_supply: req.body.placeOfSupply,
    cheque_number: req.body.chequeNumber,
    cheque_issue_date: req.body.chequeIssueDate,
    cheque_expiry_date: req.body.chequeExpiryDate,
    // description: req.body.description,
    utr_number: req.body.utrNumber,
    ref_number: req.body.refNumber,
    invoice_number: req.body.invoiceNum,
    // company: req.body.company,
    upi_id: req.body.upiId
  });
  try {
    paymentDetails
      .save()
      .then(response => {
        if (!_.isEmpty(response)) {
          Incident.findByIdAndUpdate(
            { _id: incident_id },
            {
              $set: {
                payment: response._id,
                status: req.body.status,
                paymentStatus: req.body.paymentStatus,
                invoice_raised_on: req.body.raisedOn
              }
            }
          )
            .then(incientResp => {
              res.status(200).json({
                //after success we willl update payment details id also whichever is easy
                status: "SUCCESS",
                response,
                incientResp
              });
            })
            .catch(error => {
              res.send({
                status: "ERROR",
                message: error.message
              });
            });
        } else {
          res.send({ status: "NOT_FOUND", message: "Incident Not Found" });
        }
      })
      .catch(error => {
        res.send({ status: "ERROR", message: error.message });
      });
  } catch (error) {
    res.send({ status: "ERROR", message: error.message });
  }
};

exports.paymentRequestForIncident = async (req, res, next) => {
  const issueId = req.params.id;
  try {
    let data = await Incident.findOne({ _id: issueId })
      .populate("specialization")
      .exec();
    if (!_.isEmpty(data)) {
      let updatedData = await Issues.findByIdAndUpdate(
        { _id: issueId },
        {
          $set: {
            // status: req.body.status,
            // representativeStatus: req.body.representativeStatus,
            paymentStatus: req.body.paymentStatus
          }
        },
        { new: true }
      )
        .populate("specialization")
        .exec();
      // send notification to trasporter and admin
      return res.status(200).json({
        status: "SUCCESS",
        response: updatedData
      });
    } else {
      return res.send({
        status: "NOT_FOUND",
        message: "No Incidents Found"
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: error.name,
      message: error.message
    });
  }
};

exports.payemtReports = async (req, res, next) => {
  try {
    let startDate = "";
    let endDate = "";

    if (req.params.all === "false") {
      //start date
      const start = new Date(req.params.start_date);
      start.setHours(23, 59, 59, 999);
      //end date
      const end = new Date(req.params.end_date);
      end.setHours(00, 00, 00, 000);
      //formating in exact start date
      startDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        05,
        30,
        00
      ).toISOString();
      //formatting in exact end date
      endDate = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        29,
        29,
        59
      ).toISOString();
    }

    const all = req.params.all === "false" ? false : true;
    const response = all
      ? await IncidentPayment.find()
        .populate("incident")
        .populate("user")
        .exec()
      : await IncidentPayment.find({
        paid_on_date: {
          $gte: startDate,
          $lt: endDate
        }
      })
        .populate("incident")
        .populate("user")
        .exec();

    //from case we only want to get owner, case location and truckno, truckmodel
    if (_.isEmpty(response)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Reports not found",
        totalNumOfTranscation: 0,
        totalPayment: 0
      });
    }

    const totalNumOfTranscation = response.length;
    const totalPayment = response.reduce((acc, payment) => {
      return acc + Number(payment.amount_in_decimal);
    }, 0);
    const totalPaidAmount = response.reduce((acc, payment) => {
      return acc + Number(payment.amount_paid);
    }, 0);
    return res.send({
      status: "SUCCESS",
      response,
      totalNumOfTranscation,
      totalPayment,
      totalPaidAmount
    });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};
