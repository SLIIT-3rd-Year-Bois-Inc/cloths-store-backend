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

  // star :{
  //     type : Number,
  //     required : true
  // },
  // placedTime: {
  //     type: Date,
  //     required: true,
  //     default: new Date()
  // },
  // name :{
  //     type :String,
  //     required : true}
  // ,
  // email: {
  //     type :String,
  //     required : false
  // }

  // put for images too
});

module.exports = mongoose.model("Reviews", reviewsSchema);
