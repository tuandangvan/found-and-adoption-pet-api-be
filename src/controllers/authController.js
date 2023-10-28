import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import Account from "~/models/accountModel";
import Constant from "~/utils/contants";
import { jwtUtils } from "~/utils/jwtUtils";
import { verify } from "jsonwebtoken";
import { env } from "~/config/environment";
import { accountService } from "~/services/accountService";
import { emailService } from "~/sendEmail/emailService";
import { codeOTPService } from "~/services/codeOTPService";
import { userService } from "~/services/userService";
import { generate } from "~/utils/generate";
import { token } from "~/utils/token";

const signUp = async (req, res, next) => {
  try {
    const email = req.body.email;
    const oldAccount = await accountService.findAccountByEmail(email);
    if (oldAccount) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, Constant.userExist);
    }
    const newAccount = await accountService.createAccount(req.body);

    if (newAccount) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Register success!"
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
    const customError = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
    next(customError);
  }
};

const signIn = async (req, res, next) => {
  try {
    const account = await accountService.findByCredentials(req.body);
    const user1 = await userService.findUserByAccountId(account.id);

    const accessToken = await jwtUtils.generateAuthToken({
      account: account,
      userId: user1.id
    });

    const refreshToken = await jwtUtils.generateRefreshToken({
      account: account,
      userId: user1.id
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
    const user = await userService.findUserByAccountId(account._id);
    const userData = {
      _id: user._id,
      accountId: user.accountId._id,
      email: user.accountId.email,
      role: user.accountId.role,
      isActive: user.accountId.isActive,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      refreshToken: user.accountId.refreshToken,
      accessToken: accessToken
    };

    res.status(StatusCodes.OK).json({ data: userData });
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
    next(customError);
  }
};

const signOut = async (req, res, next) => {
  try {
    //kiem tra han cua token
    const checkRefreshTokenSignIn = verify(
      await token.getTokenHeader(req),
      env.JWT_SECRET
    );
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
    res.status(StatusCodes.OK).json({ message: "Signed out successfully!" });
    return;
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
    next(customError);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = await token.getTokenHeader(req);
    const encodeToken = verify(refreshToken, env.JWT_SECRET);

    const accountTemp = await accountService.findAccountByRefreshToken(refreshToken);
    if(!accountTemp){
      throw new ApiError(StatusCodes.UNAUTHORIZED, Constant.tokenNotFound)
    }
    const account = accountService.findAccountById(encodeToken.id);
    const accessToken = await jwtUtils.generateAuthToken({
      account: account,
      userId: encodeToken.userId
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
      throw new ApiError(StatusCodes.UNAUTHORIZED, Constant.emailNotExist);
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
    const customError = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
    next(customError);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const email = req.body.email;
    const code = req.body.code;
    const oldAccount = await accountService.findAccountByEmail(email);
    if (!oldAccount) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, Constant.emailNotExist);
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
    const customError = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
    next(customError);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const account = await accountService.findAccountByEmail(email);
    if (!account) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, Constant.emailNotExist);
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

export const authController = {
  signUp,
  signIn,
  refreshToken,
  reSendEmailAuthencation,
  verifyOTP,
  forgotPassword,
  changePassword,
  signOut,
  checkExpireToken
};
