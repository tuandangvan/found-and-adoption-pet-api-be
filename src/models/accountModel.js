import mongoose, { Schema } from "mongoose";
import { enums } from "../enums/enums.js";

const accountSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: [enums.roles.USER, enums.roles.CENTER, enums.roles.ADMIN],
      default: enums.roles.USER
    },
    isActive:{
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      required: true,
      enum: [enums.statusAccount.ACTIVE, enums.statusAccount.HIDDEN, enums.statusAccount.LOCKED],
      default: enums.statusAccount.ACTIVE 
    },
    refreshToken: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const accountModel = mongoose.model("Account", accountSchema);
export default accountModel;
