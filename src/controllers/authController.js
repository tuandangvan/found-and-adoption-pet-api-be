import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import Account from "../models/accountModel.js";
import { jwtUtils } from "../utils/jwtUtils.js";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment.js";
import { accountService } from "../services/accountService.js";
import { emailService } from "../sendEmail/emailService.js";
import { codeOTPService } from "../services/codeOTPService.js";
import { userService } from "../services/userService.js";
import { generate } from "../utils/generate.js";
import { token } from "../utils/token.js";
import ErrorUser from "../messageError/errorUser.js";
import ErrorToken from "../messageError/errorToken.js";
import ErrorAccount from "../messageError/errorAccount.js";
import { enums } from "../enums/enums.js";
import { centerService } from "../services/centerService.js";
import ErrorCenter from "../messageError/errorCenter.js";
import { validate } from "../validate/validate.js";
import { postService } from "../services/postService.js";

const signUp = async (req, res, next) => {
  try {
    //validate
    const result = validate.registerValidation(req.body);
    if (result.error) {
      res
        .status(400)
        .send({ success: false, message: result.error.details[0].message });
      return;
    }

    const email = req.body.email;
    const oldAccount = await accountService.findAccountByEmail(email);
    if (oldAccount) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, ErrorUser.userExist);
    }
    const newAccount = await accountService.createAccount(req.body);

    if (newAccount) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Register success!",
        account: newAccount.id
      });
      //send email
      const code = await generate.generateOTP();
      await codeOTPService.createOTP({ email: email, code: code });
      await emailService.sendMailAuthencation({
        receiver: email,
        subject: "Verify email address",
        purpose: "VERIFY EMAIL ADDRESS!",
        firstName: email,
        lastName: "",
        require: "A request has been made to verify your email address!",
        success: "Here is your authentication code:",
        text: code
      });
    }
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    next(customError);
  }
};

const checkExpireToken = async (req, res, next) => {
  try {
    //check refresh Token by email
    const tokenHeader = await token.getTokenHeader(req);
    if (tokenHeader) {
      const checkRefreshTokenSignIn = verify(tokenHeader, env.JWT_SECRET);
      if (checkRefreshTokenSignIn) {
        const accountTemp = await accountService.findAccountByEmail(
          checkRefreshTokenSignIn.email
        );
        if (accountTemp.refreshToken == tokenHeader) {
          //nếu token còn hạn thì không gọi đăng nhập
          res
            .status(StatusCodes.OK)
            .json({ success: true, message: "Logged!" });
          return;
        }
      }
    }
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Please login!" });
  } catch (error) {
    const customError = new ApiError(StatusCodes.MULTI_STATUS, error.message);
    next(customError);
  }
};

const signIn = async (req, res, next) => {
  try {
    const account = await accountService.findByCredentials(req.body);
    if (!account.status==enums.statusAccount.LOCKED) {
      res.status(StatusCodes.NOT_FOUND).json({success: false, message: "Account is locked!"});
    }
    if (account.isActive == false) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Account is not active!" });
    }
    if (account.role == enums.roles.USER || account.role == enums.roles.ADMIN) {
      const user = await userService.findUserByAccountId(account.id);
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, ErrorUser.userInfoNotFound);
      }
      const accessToken = await jwtUtils.generateAuthToken({
        account: account,
        userId: user.id,
        centerId: null
      });

      const refreshToken = await jwtUtils.generateRefreshToken({
        account: account,
        userId: user.id,
        centerId: null
      });
      await Account.findByIdAndUpdate(
        account._id,
        {
          refreshToken: refreshToken
        },
        {
          new: true
        }
      );
      const userData = {
        _id: user._id,
        accountId: user.accountId._id,
        email: user.accountId.email,
        role: user.accountId.role,
        status: user.accountId.status,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        address: user.address,
        refreshToken: refreshToken,
        accessToken: accessToken
      };
      res.status(StatusCodes.OK).json({ success: true, data: userData });
    } else if (account.role == enums.roles.CENTER) {
      const center = await centerService.findCenterByAccountId(account.id);
      if (!center) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          ErrorCenter.centerInfoNotFound
        );
      }

      const accessToken = await jwtUtils.generateAuthToken({
        account: account,
        userId: null,
        centerId: center.id
      });

      const refreshToken = await jwtUtils.generateRefreshToken({
        account: account,
        userId: null,
        centerId: center.id
      });
      await Account.findByIdAndUpdate(
        account._id,
        {
          refreshToken: refreshToken
        },
        {
          new: true
        }
      );
      const centerData = {
        _id: center._id,
        accountId: center.accountId._id,
        email: center.accountId.email,
        role: center.accountId.role,
        status: center.accountId.status,
        name: center.name,
        avatar: center.avatar,
        phoneNumber: center.phoneNumber,
        address: center.address,
        refreshToken: refreshToken,
        accessToken: accessToken
      };
      res.status(StatusCodes.OK).json({ success: true, data: centerData });
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.MULTI_STATUS, error.message);
    next(customError);
  }
};

const signOut = async (req, res, next) => {
  try {
    const gettoken = await token.getTokenHeader(req);
    //kiem tra han cua token
    const checkRefreshTokenSignIn = verify(gettoken, env.JWT_SECRET);
    //con han
    if (checkRefreshTokenSignIn) {
      await Account.findByIdAndUpdate(
        checkRefreshTokenSignIn._id,
        {
          refreshToken: ""
        },
        {
          new: true
        }
      );
    }
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Signed out successfully!" });
    return;
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = await token.getTokenHeader(req);
    const decodeToken = verify(refreshToken, env.JWT_SECRET);

    const accountTemp = await accountService.findAccountByRefreshToken(
      refreshToken
    );
    if (!accountTemp) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorToken.tokenNotFound);
    }
    const account = await accountService.findAccountById(decodeToken.id);
    const accessToken = await jwtUtils.generateAuthToken({
      account: account,
      userId: decodeToken.userId,
      centerId: decodeToken.centerId
    });
    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    next(customError);
  }
};

const reSendEmailAuthencation = async function (req, res, next) {
  try {
    const email = req.body.email;
    const oldAccount = await accountService.findAccountByEmail(email);

    if (!oldAccount) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorAccount.emailNotExist);
    }

    const code = await generate.generateOTP();
    const checkExits = await codeOTPService.checkOPTExited({
      email: email,
      code: code
    });
    if (!checkExits) {
      await codeOTPService.createOTP({ email: email, code: code });
    }

    const sendEmail = await emailService.sendMailAuthencation({
      receiver: email,
      subject: "Resend verify email address",
      purpose: "VERIFY EMAIL ADDRESS!",
      firstName: email,
      lastName: "",
      require: "A request has been made to verify your email address!",
      success: "Here is your authentication code:",
      text: code
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Resend successfully!"
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const email = req.body.email;
    const code = req.body.code;
    const oldAccount = await accountService.findAccountByEmail(email);
    if (!oldAccount) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorAccount.emailNotExist);
    }

    const check = await codeOTPService.checkVerifyOTP({
      email: email,
      code: code
    });
    if (check == "verifyFail") {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "The authentication code is invalid or has expired!"
      });
    } else if (check == "verifySuccess") {
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Successfully authenticated account!"
      });
    } else {
      throw new ApiError(StatusCodes.UNAUTHORIZED, check.message);
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const account = await accountService.findAccountByEmail(email);
    if (!account) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorAccount.emailNotExist);
    }

    const user = await userService.findUserByAccountId(account.id);
    const newPassword = await generate.generateRandomPassword(8);
    const sendEmail = await emailService.sendMailAuthencation({
      receiver: email,
      subject: "Reset Password Found and Adoption Pets App",
      purpose: "FORGOT YOUR\nPASSWORD?",
      firstName: user.firstName,
      lastName: user.lastName,
      require: "There was a request to change your password!",
      success:
        "Your password has been changed successfully. Below is your new password:",
      text: newPassword
    });

    await accountService.updatePassword({
      email: email,
      newPassword: newPassword
    });

    if (sendEmail) {
      res.status(StatusCodes.OK).json({
        success: true,
        message: "The password reset request has been made!"
      });
    }
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    next(customError);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const accessToken = await token.getTokenHeader(req);
    const decodeToken = verify(accessToken, process.env.JWT_SECRET);
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const account = await accountService.findByCredentials({
      email: decodeToken.email,
      password: password
    });
    await accountService.updatePassword({
      account: account,
      newPassword: newPassword
    });

    const user = await userService.findUserByAccountId(account.id);

    const sendEmail = await emailService.sendMailAuthencation({
      receiver: decodeToken.email,
      subject: "Change password",
      purpose: "CHANGE PASSWORD!",
      firstName: user.firstName,
      lastName: user.lastName,
      require: "",
      success: "",
      text: null
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password changed successfully!"
    });
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    next(customError);
  }
};

const changeStatusAcc = async (req, res, next) => {
  try {
    const status = req.body.status;
    const accessToken = await token.getTokenHeader(req);
    const decodeToken = verify(accessToken, process.env.JWT_SECRET);

    //change status acc
    await accountService.changeStatus(decodeToken.id, status);
    const user = await userService.findUserByAccountId(decodeToken.id);
    if (user) {
      //change statusAcc post
      await postService.changeStatusAcc(user.id, true, status);
    } else {
      const center = await centerService.findCenterByAccountId(decodeToken.id);
      await postService.changeStatusAcc(center.id, false, status);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Status account changed successfully!"
    });
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    next(customError);
  }
};

export const authController = {
  signUp,
  signIn,
  refreshToken,
  reSendEmailAuthencation,
  verifyOTP,
  forgotPassword,
  changePassword,
  signOut,
  checkExpireToken,
  changeStatusAcc
};
