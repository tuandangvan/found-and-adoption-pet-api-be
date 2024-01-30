import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      default: ""
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
      default: "https://res.cloudinary.com/dfaea99ew/image/upload/v1698469989/a1rstfzd5ihov6sqhvck.jpg"
    },
    experience: {
      type: Boolean,
      required: true,
      default: false
    }, //0: chưa có kinh nghiệm, 1: đã có kiến thức về y tế
    favorites: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        petId: {
          type: Schema.Types.ObjectId,
          ref: "Pet"
        }
      }
    ],
    aboutMe:{
      type: String,
      default: "Nothing"
    }
  },
  {
    timestamps: true
  }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
