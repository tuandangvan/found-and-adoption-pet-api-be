import mongoose from "mongoose";
import Pet from "../models/petModel.js";
import { setEnum } from "../utils/setEnum.js";
import { enums } from "../enums/enums.js";

const createPet = async function ({ data }) {
  data.level = await setEnum.setLevelPet(data.level);
  data.gender = await setEnum.setGender(data.gender);
  data.adoptBy = data.centerId ? "CENTER" : "USER";

  const pet = new Pet({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });
  return pet.save();
};

const updatePet = async function ({ data, petId }) {
  const petUpdate = await Pet.updateOne(
    { _id: petId },
    {
      $set: { ...data }
    }
  );
  return petUpdate;
};

const deletePet = async function (id) {
  const petDelete = await Pet.deleteOne({ _id: id });
  return petDelete;
};

const findAllOfCenter = async function (centerId) {
  const pets = await Pet.find({ centerId: centerId })
    .populate("giver")
    .populate("rescue")
    .populate("linkCenter")
    .populate("centerId")
    .populate("foundOwner");
  return pets;
};

const findAll = async function () {
  const pets = await Pet.find({
    $or: [
      { statusAdopt: enums.statusAdopt.NOTHING },
      { statusAdopt: enums.statusAdopt.ADOPTING }
    ],
    adoptBy: "CENTER"
  })
    .sort({ level: -1 })
    .populate("giver")
    .populate("rescue")
    .populate("linkCenter")
    .populate("centerId")
    .populate("foundOwner");
  return pets;
};

const findAllPersonal = async function () {
  const pets = await Pet.find({
    $or: [
      { statusAdopt: enums.statusAdopt.NOTHING },
      { statusAdopt: enums.statusAdopt.ADOPTING }
    ],
    adoptBy: "USER"
  })
    .sort({ level: -1 })
    .populate("giver")
    .populate("rescue")
    .populate("linkCenter")
    .populate("centerId")
    .populate("foundOwner");
  return pets;
};

const findPetById = async function (id) {
  const pet = await Pet.findOne({ _id: id });
  return pet;
};

const changeStatus = async function (id, status) {
  const pet = await Pet.updateOne(
    { _id: id },
    { $set: { statusAdopt: status } }
  );
  return pet;
};

const changeOwner = async function (id, idOwnwer) {
  const pet = await Pet.updateOne(
    { _id: id },
    { $set: { foundOwner: idOwnwer } }
  );
  return pet;
};

const filter = async function ({ breed, color, age }) {
  const query = [];
  const ageArr = [];
  for (let i = parseInt(age[0]); i < parseInt(age[1]); i++) {
    ageArr.push(i.toString() + ".0");
    for (let j = 1; j < 10; j++) {
      ageArr.push((i + j / 10).toString());
    }
    if (i === parseInt(age[1]) - 1) {
      ageArr.push(parseInt(age[1]).toString() + ".0");
    }
  }

  breed && query.push({ breed: { $regex: breed, $options: "i" } });

  if (Array.isArray(color)) {
    const queryOr = [];
    color.forEach((element) => {
      queryOr.push({ color: { $regex: element, $options: "i" } });
    });
    query.push({ $or: queryOr });
  } else {
    color && query.push({ color: { $regex: color, $options: "i" } });
  }

  if (Array.isArray(age)) {
    const queryOr = [];
    ageArr.forEach((element) => {
      queryOr.push({ age: element.toString() });
    });
    query.push({ $or: queryOr });
  } else {
    age && query.push({ age: age.toString() });
  }

  const pet = await Pet.find({
    $or: [
      { statusAdopt: enums.statusAdopt.NOTHING },
      { statusAdopt: enums.statusAdopt.ADOPTING }
    ],
    $and: query
  })
    .sort({ level: -1 })
    .populate("giver")
    .populate("rescue")
    .populate("linkCenter")
    .populate("centerId")
    .populate("foundOwner");
  // console.log(pet);

  return pet;
};

export const petService = {
  createPet,
  updatePet,
  deletePet,
  findAllOfCenter,
  findPetById,
  findAll,
  findAllPersonal,
  changeStatus,
  changeOwner,
  filter,
};
