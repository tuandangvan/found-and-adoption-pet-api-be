import mongoose from "mongoose";
import Account from "../models/accountModel.js";
import { hashSync } from "bcrypt";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { compareSync } from "bcrypt";
import { checkRole } from "../utils/checkRole.js";
import ErrorAccount from "../messageError/errorAccount.js";

const createAccount = async function (data) {
  data.role = await checkRole.checkRoleUser(data.role);
  data.password = hashSync(data.password, 8);

  const account = new Account({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });
  return account.save();
};

const findByCredentials = async function ({ email, password }) {
  const account = await Account.findOne({ email });
  if (!account) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorAccount.emailNotExist);
  }
  const isPasswordMatch = compareSync(password, account.password);
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorAccount.wrongPassword);
  }
  return account;
};

const findAccountByIdOrEmail = async function (text) {
  const account1 = await Account.findOne({ email: text });
  const account2 = await Account.findOne({ _id: text });
  if (!account1 && !account2) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorAccount.accountNotFound);
  } else {
    if (!account1) return account2;
  }
  return account2;
};

const updatePassword = async function ({ account, newPassword }) {
  account.password = hashSync(newPassword, 8);
  await account.save();
  return true;
};

const findAccountByEmail = async function (email) {
  const account = await Account.findOne({ email });
  return account;
};

const findAccountById = async function (id) {
  const account = await Account.findOne({ _id: id });
  return account;
};

const findAccountByRefreshToken = async function (token) {
  const account = await Account.findOne({ refreshToken: token });
  return account;
};

const changeStatus = async function (accoutId, status) {
  const account = await Account.updateOne({ _id: accoutId }, {$set: {status: status}});
  return account;
};

const updateIsActive = async function (email) {
  const account = await Account.updateOne({ email: email }, {$set: {isActive: true}});
  return account;
};

export const accountService = {
  createAccount,
  findByCredentials,
  updatePassword,
  findAccountByEmail,
  findAccountById,
  findAccountByIdOrEmail,
  findAccountByRefreshToken,
  changeStatus,
  updateIsActive
};
