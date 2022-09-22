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
    sparse: true,
    required: true,
  },
  gender: {
    type: String,
    maxlength: 1,
    index: true,
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
    index: true,
    default: false,
  },
});
productSchema.index({ tags: 1 });
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
