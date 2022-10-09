const { default: mongoose } = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: false,
  },

  answer: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: false,
  },

  date: {
    type: String,
    required: false,
  },
  customer_id: {
    type: String,
    required: false,
  },
  product_id: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Questions", questionSchema);
