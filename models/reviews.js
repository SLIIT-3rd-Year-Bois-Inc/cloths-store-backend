const { default: mongoose } = require("mongoose");

const reviewsSchema = new mongoose.Schema({
  review: {
    type: String,
    required: false,
  },

  image1: {
    type: String,
    required: false,
  },
  image2: {
    type: String,
    required: false,
  },
  image3: {
    type: String,
    required: false,
  },
  rating: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: false,
  },
  fname: {
    type: String,
    required: false,
  },
  lname: {
    type: String,
    required: false,
  },
  customerID: {
    type: String,
    required: false,
  },
  productID: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Reviews", reviewsSchema);
