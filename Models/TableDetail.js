const mongoose = require("mongoose");
const { Schema } = mongoose;

let tableDetails = [
  amountTransacted,
  mpesaReceiptNumber,
  transactionDate,
  phoneNumber,
];
const TableDetailSchema = new Schema({
  amountTransacted: {
    type: Number,
    required: true,
  },
  mpesaReceiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
  transactionDate: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  tillBalance: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("TableDetail", TableDetailSchema);
