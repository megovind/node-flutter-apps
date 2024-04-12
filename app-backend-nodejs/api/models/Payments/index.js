const mongoose = require("mongoose");

const incidentPaymentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  incident: { type: String, default: null, ref: "Incidents" },
  user: { type: String, default: null, ref: "User" },
  payment_mode: { type: String }, //Cash, cheque, RTGS, IMPS, NEFT, NetBanking, UPI(I don't think we are using this)
  // sender_name: { type: String, default: null },
  sender_ac_number: { type: String, default: null },
  // reciever_name: { type: String, default: null },
  // reciever_ac_number: { type: String, default: null },
  senders_bank: { type: String, default: null },
  sender_ifsc: { type: String, default: null },
  amount_in_words: { type: String, default: null },
  amount_in_decimal: { type: String, default: null },
  amount_paid: { type: String, default: null },
  invoice_raised_on: { type: Date, default: null },
  paid_on_date: { type: Date, default: null },
  transaction_id: { type: String, default: null },
  // place_of_billing: { type: String, default: null },
  // place_of_supply: { type: String, default: null },
  cheque_number: { type: String, default: null },
  cheque_issue_date: { type: Date, default: null },
  cheque_expiry_date: { type: Date, default: null },
  utr_number: { type: String, default: null },
  ref_number: { type: String, default: null },
  invoice_number: { type: String, default: null },
  // description: { type: String, default: null },
  // company: { type: String, default: null },
  upi_id: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("IncidentPayment", incidentPaymentSchema);
