import mongoose from "mongoose";
import Notify from "../models/notifyModel.js";

const createNotify = async function (data) {
  const notify = new Notify({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });
  return notify.save();
};

const find20Notify = async function (userId, centerId) {
  var latestNotifications;
  if (userId) {
    latestNotifications = await Notify.find({ 'receiver': {
      $elemMatch: {
        userId: userId
      }
    } })
      .sort({ createdAt: -1 })
      .limit(20);
  }else if(centerId){
    latestNotifications = await Notify.find({'receiver': {
      $elemMatch: {
        centerId: centerId
      }
    } })
      .sort({ createdAt: -1 })
      .limit(20);
  }
  return latestNotifications;
};

export const notifyService = {
  createNotify,
  find20Notify
};
