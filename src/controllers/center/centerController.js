import { StatusCodes } from "http-status-codes";
import { enums } from "~/enums/enums";
import ErrorCenter from "~/messageError/errorCenter";
import ErrorAccount from "~/messageError/errorAccount";
import { accountService } from "~/services/accountService";
import { centerService } from "~/services/centerService";
import ApiError from "~/utils/ApiError";
import { validate } from "~/validate/validateUser";

const createInfoForCenter = async (req, res, next) => {
  try {
    //validate
    const result = validate.infoCenterValidate(req.body);
    if (result.error) {
      res.status(400).send({ error: result.error.details[0].message });
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

export const centerController = {
  createInfoForCenter,
  updateCenter
};
