const mongoose = require("mongoose");
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  stkPushNo: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
}); //This is how the database fields are going to be filled up.

module.exports = mongoose.model("Customer", CustomerSchema);
