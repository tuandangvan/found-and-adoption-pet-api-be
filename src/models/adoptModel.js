import mongoose, { Schema } from "mongoose";
import { enums } from "../enums/enums";

const adoptSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    centerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Center",
      required: true
    },
    petId: {
      type: mongoose.Schema.ObjectId,
      ref: "Pet",
      required: true
    },
    dateInterview: {
      type: Date,
      required: true
    },
    dateAdoption: {
      type: Date,
      required: true
    },
    descriptionAdoption: {
      type: String,
      required: true
    },
    cancelledReasonCenter: {
      type: String,
      default: "Nothing"
    },
    cancelledReasonUser: {
      type: String,
      default: "Nothing"
    },
    statusAdopt: {
      type: String,
      required: true,
      enum: [
        enums.statusAdopt.PENDING,
        enums.statusAdopt.ACCEPTED,
        enums.statusAdopt.CANCELLED
      ],
      default: enums.statusAdopt.PENDING
    }
  },
  {
    timestamps: true
  }
);

const adoptModel = mongoose.model("Adopt", adoptSchema);
export default adoptModel;
