import { StatusCodes } from "http-status-codes";
import { petService } from "../../services/petService.js";
import { userService } from "../../services/userService.js";
import ApiError from "../../utils/ApiError.js";
import { centerService } from "../../services/centerService.js";
import { accountService } from "../../services/accountService.js";
import ErrorAccount from "../../messageError/errorAccount.js";
import { postService } from "../../services/postService.js";

const getAllUser = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    res.status(StatusCodes.OK).json({
      success: true,
      data: users
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getAllCenter = async (req, res, next) => {
  try {
    const centers = await centerService.findAllCenterByIdAD();
    res.status(StatusCodes.OK).json({
      success: true,
      data: centers
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getAllPets = async (req, res, next) => {
  try {
    const pets = await petService.findAll();
    res.status(StatusCodes.OK).json({
      success: true,
      data: pets
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const lockAndUnLockAcc = async (req, res, next) => {
  try {
    const status = req.body.status;
    const email = req.body.email;
    const acc = await accountService.findAccountByEmail(email);
    if (!acc) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorAccount.accountNotFound
      });
    }
    const user = await userService.findUserByAccountId(acc.id);
    if (user) {
      await accountService.changeStatus(acc.id, status);
      await postService.changeStatusAcc(user.id, true, status);
      res.status(StatusCodes.NOT_FOUND).json({
        success: true,
        message: `Change ${status} successfully!`
      });
    } else {
      const center = await centerService.findCenterByAccountId(acc.id);
      if (center) {
        await accountService.changeStatus(acc.id, status);
        await postService.changeStatusAcc(center.id, false, status);
        res.status(StatusCodes.NOT_FOUND).json({
          success: true,
          message: `Change ${status} successfully!`
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: `Change ${status} failed!`
        });
      }
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

export const adminController = {
  getAllUser,
  getAllCenter,
  getAllPets,
  lockAndUnLockAcc
};
