const { default: mongoose } = require("mongoose");

const reviewsSchema = new mongoose.Schema({
  // customer_id :{
  //     type: mongoose.Types.ObjectId,
  //     required: true
  // },
  // product_id :{
  //     type: mongoose.Types.ObjectId,
  //     required: true
  // },
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
});

module.exports = mongoose.model("Reviews", reviewsSchema);
