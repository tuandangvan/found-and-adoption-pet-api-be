import { verify } from "jsonwebtoken";
import { env } from "../../config/environment.js";
import { chatService } from "../../services/chatService.js";
import { messageService } from "../../services/messageService.js";
import { token } from "../../utils/token.js";

// Tạo cuộc trò chuyện giữa hai người
const createMessage = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const accessToken = verify(await token.getTokenHeader(req), env.JWT_SECRET);
    const senderId = accessToken.userId
      ? { userId: accessToken.userId, centerId: null }
      : { userId: null, centerId: accessToken.centerId };
    const { content, attachment } = req.body;

    const chat = await chatService.findById(chatId);
    // const isUserInChat = chat.participants.includes(senderId);

    // if (!isUserInChat) {
    //   return res.status(404).json({ status: "User not in GroupChat" });
    // }
    const messageData = {
      content,
      sender: senderId,
      chat: chatId
    };
    // if (attachment) {
    //     const uploadResponse = await cloudinary.uploader.upload(attachment, {
    //         upload_preset: 'chat-app'
    //     })
    //     messageData.attachments = [{
    //         type: uploadResponse.resource_type,
    //         url: uploadResponse.secure_url
    //     }]
    // }

    const message = await messageService.createMessage(messageData);
    const saveMessageId = await chatService.saveMessageId(chat, message._id);

    await message.populate("sender.userId", "firstName lastName avatar");
    await message.populate("sender.centerId", "name avatar");

    res.status(201).json({success: true, message: message });
  } catch (error) {
    console.error(error);
    res.status(400).json({success: false, status: "Error" });
  }
};
const getMessagesInChat = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 15;
    const chatId = req.params.chatId;
    const totalItems = await messageService.countMessage(chatId);
    const totalPages = Math.ceil(totalItems / limit);

    const messages = await messageService.findMessageByChatIdAndPage(
      chatId,
      page,
      limit
    );
    res.status(200).json({success: true, messages, totalPages });
  } catch (error) {
    console.error(error);
    res.status(400).json({success: false, status: "Error" });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.messageId;

    const updatedMessage = await messageModel.findByIdAndUpdate(messageId, {
      isRead: true,
    });

    if (!updatedMessage) {
      return res.status(404).json({success: true, message: "Tin nhắn không tồn tại" });
    }
    return res.status(200).json({success: true, updatedMessage});
  } catch (error) {
    console.error(error);
    return res.status(400).json({success: true, message: "Lỗi server" });
  }
};

export const messageController = {
  createMessage,
  getMessagesInChat,
  markMessageAsRead
};
