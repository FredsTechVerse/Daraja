const mongoose = require("mongoose"); //Module required
const { Schema } = mongoose; //The present required

// Using the present.
const NameSchema = new Schema({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
});
