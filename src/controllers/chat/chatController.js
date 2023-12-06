import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { env } from "../../config/environment.js";
import { enums } from "../../enums/enums.js";
import chatModel from "../../models/chatModel.js";
import { centerService } from "../../services/centerService.js";
import { chatService } from "../../services/chatService.js";
import { userService } from "../../services/userService.js";
import ApiError from "../../utils/ApiError.js";
import { token } from "../../utils/token.js";

// Tạo cuộc trò chuyện giữa hai người
const createChatBetweenTwoUsers = async (req, res, next) => {
  try {
    const userId1 = req.params.id;
    const getToken = await token.getTokenHeader(req);
    const accessToken = verify(getToken, env.JWT_SECRET);

    let user1Id;
    let user2Id;
    if (accessToken?.userId) {
      const user = await userService.findInfoUserByUserId(accessToken.userId);
      user2Id = {
        userId: user._id,
        centerId: null
      };
    } else if (accessToken?.centerId) {
      const center = await centerService.findCenterById(accessToken.centerId);
      user2Id = {
        userId: null,
        centerId: center._id
      };
    }

    const user = await userService.findInfoUserByUserId(userId1);
    if (user) {
      user1Id = {
        userId: user._id,
        centerId: null
      };
    } else {
      const center = await centerService.findCenterById(userId1);
      user1Id = {
        userId: null,
        centerId: center._id
      };
    }

    const participants1 = [user1Id, user2Id];
    const participants2 = [user2Id, user1Id];

    //check exist
    const existingChat = await chatService.findByPaticipants(participants1, participants2);

    if (existingChat) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Chat exist!"
      });
    }
    const chat = await chatService.createChat(participants1);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Success!"
    });
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, "Fail!"));
  }
};

// Lấy danh sách cuộc trò chuyện của người dùng
const getChatsForUser = async (req, res) => {
  try {
    const getToken = await token.getTokenHeader(req);
    const accessToken = verify(getToken, env.JWT_SECRET);

    const chats = await chatService.findAllChatById(
      accessToken.role == enums.roles.USER
        ? accessToken.userId
        : accessToken.centerId,
      accessToken.role
    );
    return res.status(200).json({ chats });

    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const populatedChat = await ChatModel.populate(chat, {
          path: "participants",
          select: "firstName lastName email avatarURL"
        });
        const latestMessage = await MessageModel.findOne({ chat: chat._id })
          .sort({ createdAt: -1 })
          .lean()
          .populate({
            path: "sender",
            select: "firstName lastName isRead"
          });

        populatedChat.messages = [latestMessage];
        return populatedChat;
      })
    );
    res.status(200).json({ chats: populatedChats });
  } catch (error) {
    console.error(error);
    res.status(400).json({success: false, status: "Error" });
  }
};

export const chatController = {
  createChatBetweenTwoUsers,
  getChatsForUser
};
