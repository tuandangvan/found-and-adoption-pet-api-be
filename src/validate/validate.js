import Joi from "@hapi/joi";
import { enums } from "../enums/enums.js";

// Register Validate
const registerValidation = function (data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{8,30}$/)
      .required(),
    role: Joi.string().required().valid("USER", "CENTER")
  });
  const result = schema.validate(data);
  return result;
};

const infoUserValidate = function (data) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string()
      .required()
      .regex(/^\d{10}$/, "10 character"),
    address: Joi.string().required(),
    experience: Joi.boolean().required()
  });
  const result = schema.validate(data);
  return result;
};

const infoCenterValidate = function (data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string()
      .required()
      .regex(/^\d{10}$/, "10 character"),
    address: Joi.string().required(),
    avatar: Joi.string()
  });
  const result = schema.validate(data);
  return result;
};

const petValidate = function (data) {
  const schema = Joi.object({
    namePet: Joi.string().required(),
    species: Joi.string().required(),
    breed: Joi.string().required(),
    gender: Joi.string()
      .required()
      .valid(enums.genders.MALE, enums.genders.FEMALE, enums.genders.ORTHER),
    color: Joi.string().required(),
    description: Joi.string(),
    images: Joi.array(),
    healthInfo: Joi.string(),
    level: Joi.string().required().valid(
      enums.statusPet.NORMAL,
      enums.statusPet.URGENT
    )
  });
  const result = schema.validate(data);
  return result;
};

const postValidate = function (data) {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    images: Joi.array(),
  });
  const result = schema.validate(data);
  return result;
};

export const validate = {
  registerValidation,
  infoUserValidate,
  infoCenterValidate,
  petValidate,
  postValidate
};
