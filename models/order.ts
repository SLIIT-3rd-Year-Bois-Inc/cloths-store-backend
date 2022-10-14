import mongoose from "mongoose";
import { logger } from "../logger";
const Product = require("./Product");

interface IOrder {
  products: [
    {
      size: string;
      qty: number;
      product_id: mongoose.ObjectId;
    }
  ];
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
    products: [
      {
        size: {
          type: String,
        },
        qty: {
          type: Number,
        },
        product_id: {
          type: mongoose.Types.ObjectId,
        },
      },
    ],
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
  let p_ids = this.products.map((p) => p.product_id);
  let res = await Product.find({ _id: { $in: p_ids } });

  let total = 0;

  for (const r of res) {
    total += r.price;
  }

  this.total = total;
});

export function aggregateOrdersWithProducts(customer_id: string) {
  return [
    {
      $match: {
        customer_id: mongoose.Types.ObjectId.createFromHexString(customer_id),
      },
    },
    {
      $unwind: {
        path: "$products",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product_id",
        foreignField: "_id",
        as: "products.resolved",
      },
    },
    {
      $unwind: {
        path: "$products.resolved",
      },
    },
    {
      $group: {
        _id: "$_id",
        products: {
          $push: "$products",
        },
        placed_time: {
          $first: "$placed_time",
        },
        state: {
          $first: "$state",
        },
      },
    },
  ];
}
export const Order = mongoose.model("orders", orderSchema);
