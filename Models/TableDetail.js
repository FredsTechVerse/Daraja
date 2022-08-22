const mongoose = require("mongoose");
const { Schema } = mongoose;

const TableDetailSchema = new Schema({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
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
  createdAt: {
    type: Date,
    default: () => Date.now(),
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
