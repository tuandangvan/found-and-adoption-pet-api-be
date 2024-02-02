import mongoose from "mongoose";
import Center from "../models/centerModel.js";

const createCenter = async function ({ data, id }) {
  const center = new Center({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    accountId: id
  });
  return center.save();
};

const updateCenter = async function ({ data, centerId }) {
  const center = await Center.updateOne(
    { _id: centerId },
    {
      $set: { ...data }
    }
  );
  return center;
};

const findCenterByAccountId = async function (accountId) {
  const center = await Center.findOne({ accountId: accountId }).populate(
    "accountId"
  );
  return center;
};

const addPetForCenter = async function ({ centerId, petId }) {
  const center = await Center.updateOne(
    { _id: centerId },
    {
      $push: { petIds: petId }
    }
  );
  return center;
};

const addPetLinkForCenter = async function ({ centerId, petId }) {
  const center = await Center.updateOne(
    { _id: centerId },
    {
      $push: { petLinkIds: petId }
    }
  );
  return center;
};

const deletePetForCenter = async function ({ centerId, petId }) {
  const center = await Center.updateOne(
    { _id: centerId },
    {
      $pull: { petIds: petId }
    }
  );
  return center;
};

const findCenterById = async function (id) {
  const center = await Center.findOne({ _id: id });
  return center;
};

const findInfoCenterById = async function (id) {
  const center = await Center.findOne({ _id: id }).populate("accountId");
  return center;
};

const findAllCenterByIdAD = async function () {
  const center = await Center.find().populate("accountId");
  return center;
};

const findAllCenter = async function () {
  const center = await Center.find().select("id name location");
  return center;
};

export const centerService = {
  createCenter,
  updateCenter,
  addPetForCenter,
  addPetLinkForCenter,
  findCenterById,
  findCenterByAccountId,
  deletePetForCenter,
  findInfoCenterById,
  findAllCenterByIdAD,
  findAllCenter
};
