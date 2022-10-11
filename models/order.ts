import mongoose from "mongoose";
import { logger } from "../logger";
const Product = require("./Product");

interface IOrder {
  product_ids: mongoose.ObjectId[];
  customer_id: mongoose.ObjectId;
  total: number;
  placed_time: Date;
  state: string;
  note: string;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    customer_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    product_ids: {
      type: [mongoose.Types.ObjectId],
      required: true,
    },
    placed_time: {
      type: Date,
      required: true,
      default: new Date(),
    },
    total: {
      type: Number,
      required: false,
    },
    note: {
      type: String,
    },
    state: {
      type: String,
      required: true,
      enum: [
        "success",
        "pending",
        "not_success",
        "delivered",
        "delivery_failed",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function () {
  let res = await Product.find({ _id: { $in: this.product_ids } });

  if (!res || res.length != this.product_ids.length) {
    throw new Error("One or more products doesn't exist in the Database");
  }

  let total = 0;

  for (const r of res) {
    total += r.price;
  }

  this.total = total;
});

export const Order = mongoose.model("orders", orderSchema);
