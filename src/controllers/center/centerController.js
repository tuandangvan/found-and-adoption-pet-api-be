import { StatusCodes } from "http-status-codes";
import { enums } from "../../enums/enums.js";
import ErrorCenter from "../../messageError/errorCenter.js";
import ErrorAccount from "../../messageError/errorAccount.js";
import { accountService } from "../../services/accountService.js";
import { centerService } from "../../services/centerService.js";
import ApiError from "../../utils/ApiError.js";
import { validate } from "../../validate/validate.js";

const createInfoForCenter = async (req, res, next) => {
  try {
    //validate
    const result = validate.infoCenterValidate(req.body);
    if (result.error) {
      res.status(400).send({success: false, message: result.error.details[0].message });
      return;
    }
    const account = await accountService.findAccountById(req.params.accountId);
    if (!account)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ErrorAccount.accountNotFound
      );

    if (account.role == enums.roles.USER)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "You have registered center rights!"
      );
    const center = await centerService.createCenter({
      data: req.body,
      id: account.id
    });
    if (center)
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: center
      });
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const updateCenter = async (req, res, next) => {
  try {
    const centerId = req.params.centerId;
    const center = await centerService.findCenterById(centerId);

    if (!center) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCenter.centerNotExist);
    }
    const centers = await centerService.updateCenter({
      data: req.body,
      centerId: centerId
    });
    res.status(StatusCodes.OK).json({
      success: true,
      data: centers
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getCenter = async (req, res, next) => {
  try {
    const centerId = req.params.centerId;
    const center = await centerService.findInfoCenterById(centerId);

    if(center.accountId.status==enums.statusAccount.LOCKED){
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCenter.centerInfoNotFound);
    }

    const centerData = {
      _id: center._id,
      accountId: center.accountId._id,
      email: center.accountId.email,
      role: center.accountId.role,
      avatar: center.avatar,
      status: center.accountId.status,
      name: center.name,
      phoneNumber: center.phoneNumber,
      address: center.address,
      aboutMe: center.aboutMe,
      createdAt: center.createdAt,
      updatedAt: center.updatedAt
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: centerData
    })
  } catch(error){
    next(new ApiError(StatusCodes.NOT_FOUND, error.message));
  }
};

export const centerController = {
  createInfoForCenter,
  updateCenter,
  getCenter
};
