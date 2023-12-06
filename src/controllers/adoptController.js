import { StatusCodes } from "http-status-codes";
import { adoptService } from "../services/adoptService";
import { petService } from "../services/petService";
import ApiError from "../utils/ApiError";
import { token } from "../utils/token";
import ErrorPet from "../messageError/errorPet";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment";
import { enums } from "../enums/enums";
import { setEnum } from "../utils/setEnum";
import ErrorAdopt from "../messageError/errorAdopt";

const adoption = async (req, res, next) => {
  try {
    const adoptReq = req.body;
    const pet = await petService.findPetById({ _id: adoptReq.petId });
    if (!pet) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPet.petNotFound);
    }
    if(pet.statusAdopt == enums.statusAdopt.HAS_ONE_OWNER){
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, ErrorPet.petHasOwner);
    }
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const adopt = await adoptService.findAdoptUserCancel(
      decodeToken.userId,
      adoptReq.petId
    );
    if (adopt) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorAdopt.adoptExist);
    }
    //create request
    const newAdopt = await adoptService.createAdopt({
      data: adoptReq,
      id: decodeToken.userId,
      centerId: pet.centerId
    });
    //change status by ADOPTING
    if (newAdopt) {
      if (pet.statusAdopt == enums.statusAdopt.NOTHING) {
        await petService.changeStatus(
          adoptReq.petId,
          enums.statusAdopt.ADOPTING
        );
      }
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Pet adoption request successful!",
        id: newAdopt.id
      });
    } else {
      throw new ApiError(StatusCodes.NOT_FOUND, "Adopt error!");
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const adoptionStatusAdopt = async (req, res, next) => {
  try {
    const adoptId = req.params.adoptId;
    const status = await setEnum.setStatusAdopt(req.body.statusAdopt);
    const reason = req.body.reason;

    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);

    const adopt = await adoptService.findAdoptById(adoptId);

    if (!adopt) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorAdopt.adoptNotFound);
    }

    if (
      status == enums.statusAdopt.ACCEPTED &&
      decodeToken.centerId &&
      adopt.statusAdopt == enums.statusAdopt.PENDING
    ) {
      //find adopts of a pet
      const adopts = await adoptService.findByPetIdPENDING_ExceptUserSelect(
        adopt.petId,
        adopt.userId
      );
      if (adopts) {
        //cancelled adopt orther with reason has been adopted
        adopts.forEach(async (adoptItem) => {
          await adoptService.changeStatus(
            adoptItem.id,
            enums.statusAdopt.CANCELLED
          );
          await adoptService.cancelledReason(adoptItem.id, true, 'Has been adopted');
        });
      }

      await petService.changeOwner(adopt.petId, adopt.userId);
      await petService.changeStatus(
        adopt.petId,
        enums.statusAdopt.HAS_ONE_OWNER
      );

      await adoptService.changeStatus(adopt.id, enums.statusAdopt.ACCEPTED);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "The request has been accepted!"
      });
    } else if (
      //center cancelled
      status == enums.statusAdopt.CANCELLED &&
      decodeToken.centerId &&
      adopt.statusAdopt == enums.statusAdopt.PENDING
    ) {
      await petService.changeStatus(adopt.petId, enums.statusAdopt.NOTHING);
      await adoptService.changeStatus(adopt.id, enums.statusAdopt.CANCELLED);
      await adoptService.cancelledReason(adopt.id, true, reason);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Cancel adoption successfully!"
      });
    } else if (
      //user cancelled
      status == enums.statusAdopt.CANCELLED &&
      decodeToken.userId &&
      adopt.statusAdopt == enums.statusAdopt.PENDING
    ) {
      await petService.changeStatus(adopt.petId, enums.statusAdopt.NOTHING);
      await adoptService.changeStatus(adopt.id, enums.statusAdopt.CANCELLED);
      await adoptService.cancelledReason(adopt.id, false, reason);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Cancel adoption successfully!"
      });
    } else {
      res.status(StatusCodes.NOT_ACCEPTABLE).json({
        success: true,
        message: "Adopt failed!"
      });
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const getAdoptCenter = async (req, res, next) => {
  try {
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const centerId = decodeToken.centerId;
    const statusAdoption = req.query.status;

    const adopts = await adoptService.find_show_AdoptCenterByCenterIdStatus(
      centerId,
      statusAdoption
    );
    res.status(StatusCodes.OK).json({
      success: true,
      data: adopts
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const getAdoptUser = async (req, res, next) => {
  try {
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const userId = decodeToken.userId;
    const statusAdoption = req.query.status;

    const adopts = await adoptService.find_show_AdoptCenterByUserIdStatus(
      userId,
      statusAdoption
    );
    res.status(StatusCodes.OK).json({
      success: true,
      data: adopts
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};
export const adoptController = {
  adoption,
  adoptionStatusAdopt,
  getAdoptCenter,
  getAdoptUser
};
