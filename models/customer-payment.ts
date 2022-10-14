import mongoose from "mongoose";

interface ICustomerPaymentMethod {
  customer_id: mongoose.ObjectId;
  card_number: number;
  cvc: number;
  name_on_card: string;
  expiry_month: number;
  expiry_year: number;
}

const customerPaymentMethodSchema = new mongoose.Schema<ICustomerPaymentMethod>(
  {
    customer_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    card_number: {
      type: Number,
      required: true,
      unique: true,
    },
    cvc: {
      type: Number,
      required: true,
    },
    name_on_card: {
      type: String,
      required: true,
    },
    expiry_month: {
      type: Number,
      required: true,
    },
    expiry_year: {
      type: Number,
      required: true,
    },
  }
);

customerPaymentMethodSchema.index({ card_number: "hashed" });
export const CustomerPaymentMethod = mongoose.model(
  "customer-payment-method",
  customerPaymentMethodSchema
);
