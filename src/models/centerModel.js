import mongoose, { Schema } from "mongoose";

const centerSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default: "Chưa cập nhật"
    },
    location: {
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      }
    },
    avatar: {
      type: String,
      required: true,
      default: "https://res.cloudinary.com/dfaea99ew/image/upload/v1698469989/a1rstfzd5ihov6sqhvck.jpg"
    },
    aboutMe:{
      type: String,
      default: "Nothing"
    },
    petIds: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Pet" 
    }],
    petLinkIds: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Pet" 
    }],
  },
  {
    timestamps: true
  }
);

const centerModel = mongoose.model("Center", centerSchema);
export default centerModel;
