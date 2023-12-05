import mongoose from "mongoose";
import Adopt from "../models/adoptModel.js";

const createAdopt = async function ({ data, id, centerId }) {
  const adopt = new Adopt({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    userId: id,
    centerId
  });
  return adopt.save();
};

const findAdoptById = async function (id) {
  const adopt = await Adopt.findOne({ _id: id });
  return adopt;
};

const changeStatus = async function (id, statusAdopt) {
  const adopt = await Adopt.updateOne(
    { _id: id },
    { $set: { statusAdopt: statusAdopt } }
  );
  return adopt;
};

const cancelledReason = async function (id, isCenter, reason) {
  if (isCenter) {
    const adopt = await Adopt.updateOne(
      { _id: id },
      {
        $set: { cancelledReasonCenter: reason }
      }
    );
    return adopt;
  } else {
    const adopt = await Adopt.updateOne(
      { _id: id },
      {
        $set: { cancelledReasonUser: reason }
      }
    );
    return adopt;
  }
};

const findAdoptUserCancel = async function (userId, petId) {
  const adopt = await Adopt.findOne({
    userId: userId,
    petId: petId,
    statusAdopt: "PENDING"
  });
  return adopt;
};

const findAdoptCenterByCenterIdStatus = async function (centerId, statusAdopt) {
  const adopts = await Adopt.find({
    centerId: centerId,
    statusAdopt: statusAdopt
  }).populate('petId').populate('centerId').populate('userId');
  return adopts;
};

const findAdoptCenterByUserIdStatus = async function (userId, statusAdopt) {
  const adopts = await Adopt.find({
    userId: userId,
    statusAdopt: statusAdopt
  }).populate('petId').populate('centerId').populate('userId');
  return adopts;
};

export const adoptService = {
  createAdopt,
  findAdoptById,
  changeStatus,
  cancelledReason,
  findAdoptUserCancel,
  findAdoptCenterByCenterIdStatus,
  findAdoptCenterByUserIdStatus
};
