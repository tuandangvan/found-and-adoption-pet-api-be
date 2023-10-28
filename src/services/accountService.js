import mongoose from "mongoose";
import Account from "~/models/accountModel";
import { hashSync } from "bcrypt";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { compareSync } from "bcrypt";
import { checkRole } from "~/utils/checkRole";
import Contants from "~/utils/contants";

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
    throw new ApiError(StatusCodes.UNAUTHORIZED, Contants.userNotExist);
  }
  const isPasswordMatch = compareSync(password, account.password);
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, Contants.wrongPassword);
  }
  return account;
};

const findAccountByIdOrEmail = async function (text) {
  const account1 = await Account.findOne({ email: text });
  const account2 = await Account.findOne({ _id: text });
  if (!account1 && !account2) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, Contants.userNotExist);
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

export const accountService = {
  createAccount,
  findByCredentials,
  updatePassword,
  findAccountByEmail,
  findAccountById,
  findAccountByIdOrEmail,
  findAccountByRefreshToken
};
