import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    uppercase: true,
    required: true,
  },
  price: {
    type: Number,
    index: true,
    required: true,
  },
  gender: {
    type: String,
    maxlength: 1,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  imagesUrls: [
    [
      {
        type: String,
      },
    ],
  ],
  description: {
    type: String,
  },
  color: {
    type: String,
  },
  quantity: {
    type: Map,
    of: Number,
  },
  archived: {
    type: Boolean,
    default: false,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
