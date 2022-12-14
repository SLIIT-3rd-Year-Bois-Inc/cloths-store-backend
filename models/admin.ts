import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { logger } from "../logger";

interface ICustomerMethods {
  passwordMatch: (candidatePassword: string) => Promise<boolean>;
}

const adminSchema = new mongoose.Schema<{}, {}, ICustomerMethods>({
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
});

// Validates email
adminSchema.path("email").validate(async (email: string) => {
  let emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return emailRegex.test(email);
}, "Invalid email");

// Hash the password
adminSchema.pre("save", function (next) {
  let admin = this as any;
  logger.debug(admin);

  // Only hash the password if it has been modified (or is new)
  if (!admin.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(admin.password, salt);

  admin.password = hashedPassword;
  next();
});

adminSchema.methods.passwordMatch = async function (candidatePassword: string) {
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

adminSchema.index({ f_name: "text", l_name: "text", email: "text" });
export const Admin = mongoose.model("Admin", adminSchema);
