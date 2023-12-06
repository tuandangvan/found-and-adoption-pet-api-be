import { StatusCodes } from "http-status-codes";
import { enums } from "../../enums/enums.js";
import ErrorUser from "../../messageError/errorUser.js";
import ErrorAccount from "../../messageError/errorAccount.js";
import { accountService } from "../../services/accountService.js";
import { userService } from "../../services/userService.js";
import ApiError from "../../utils/ApiError.js";
import { validate } from "../../validate/validate.js";

const createInformation = async (req, res, next) => {
  try {
    //validate infomation
    const result = validate.infoUserValidate(req.body);
    if (result.error) {
      res
        .status(400)
        .send({ success: true, message: result.error.details[0].message });
      return;
    }

    const account = await accountService.findAccountById(req.params.accountId);
    if (!account) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ErrorAccount.accountNotFound
      );
    }
    if (account.role == enums.roles.CENTER) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "You have registered user rights!"
      );
    }
    const infoUser = await userService.createUser({
      data: req.body,
      id: account.id
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: infoUser
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const findUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await userService.findInfoUserByUserId(userId);

    if (!user.accountId.isActive) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorUser.userInfoNotFound);
    }

    const userData = {
      _id: user._id,
      accountId: user.accountId._id,
      email: user.accountId.email,
      role: user.accountId.role,
      avatar: user.avatar,
      isActive: user.accountId.isActive,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      experience: user.experience,
      aboutMe: user.aboutMe
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(new ApiError(StatusCodes.NOT_FOUND, error.message));
  }
};

const findUserByNamePhoneEmail = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.body.search);
    res.status(StatusCodes.OK).json({
      success: true,
      data: users
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const changeInfomation = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await userService.findUserById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorUser.userNotExist);
    }
    const users = await userService.updateUser({
      data: req.body,
      userId: userId
    });
    res.status(StatusCodes.OK).json({
      success: true,
      data: users
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};
export const userController = {
  createInformation,
  findUser,
  findUserByNamePhoneEmail,
  changeInfomation
};
