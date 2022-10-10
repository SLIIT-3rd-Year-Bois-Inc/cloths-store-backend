import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { logger } from "../logger";

interface ICustomerMethods {
  passwordMatch: (candidatePassword: string) => Promise<boolean>;
}

type Address = {
  _id: mongoose.Types.ObjectId;
  contact_name: string;
  line_1: string;
  line_2: string;
  zip: number;
  default: boolean;
};

interface ICustomer {
  f_name: string;
  l_name: string;
  email: string;
  address: Address[];
  cart: any[];
  wish_list: any[];
  image: string;
  password: string;
  gender: string;
  dob: Date;
  disabled: boolean;
  verified: boolean;
  verification_code: string;
}

const customerSchema = new mongoose.Schema<ICustomer, {}, ICustomerMethods>({
  f_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  l_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
    unique: true,
    lowercase: true,
  },
  address: [
    {
      _id: {
        type: mongoose.Types.ObjectId,
        default: new mongoose.Types.ObjectId().toHexString(),
        index: { sparse: true },
      },
      contact_name: {
        type: String,
        required: true,
      },
      line_1: {
        type: String,
        required: true,
      },
      line_2: {
        type: String,
      },
      zip: {
        type: Number,
        required: true,
      },
      contact_number: {
        type: String,
        required: true,
      },
      default: {
        type: Boolean,
        default: false,
      },
    },
  ],
  cart: [
    {
      product_id: {
        type: String,
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
    },
  ],
  wish_list: [
    {
      product_id: {
        type: String,
        required: true,
      },
    },
  ],
  image: { type: String },
  password: { type: String, required: true },
  gender: {
    type: String,
    required: true,
    enum: ["female", "male", "rather-not-say", "N"],
  },
  dob: { type: Date, required: true },
  disabled: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verification_code: {
    type: String,
    default: () => Math.random().toString(36).slice(2),
  },
});

// Validates email
customerSchema.path("email").validate(async (email: string) => {
  let emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return emailRegex.test(email);
}, "Invalid email");

// Hash the password
customerSchema.pre("save", function (next) {
  let customer = this as any;
  logger.debug(customer);

  // Only hash the password if it has been modified (or is new)
  if (!customer.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(customer.password, salt);

  customer.password = hashedPassword;
  next();
});

customerSchema.methods.passwordMatch = async function (
  candidatePassword: string
) {
  console.log(this);
  return await bcrypt.compare(candidatePassword, this.password);
};
/* customerSchema
    .path('dob')
    .validate(async (date: string) => {
        let yearsAgoDate = new Date();
        yearsAgoDate = yearsAgoDate.setFullYear(yearsAgoDate.getFullYear() - 18)

        return (new Date(date) < yearsAgoDate)
    }, "Date needs to be at least 18 years ago")
 */

customerSchema.index({ f_name: "text", l_name: "text", email: "text" });
export const Customer = mongoose.model("Customer", customerSchema);
