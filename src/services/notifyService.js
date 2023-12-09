import mongoose from "mongoose";
import Notify from "../models/notifyModel.js";

const createNotify = async function (data) {
  const notify = new Notify({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });
  return notify.save();
};


export const notifyService = {
  createNotify,
};
