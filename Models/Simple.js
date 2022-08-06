const mongoose = require("mongoose");
const { Schema } = mongoose;

const SimpleSchema = new Schema({
  count: {
    type: Number,
    required: true,
  },
}); //This is how the database fields are going to be filled up.

module.exports = mongoose.model("Simple", SimpleSchema);
