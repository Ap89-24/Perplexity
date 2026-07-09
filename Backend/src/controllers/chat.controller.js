import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateResponse, generateTitle } from "../services/ai.service.js";





export const sendMessage = async (req, res) => {
    const { message, chatId } = req.body;

    let title = null, chat = null;

    // Existing chat
    if (chatId) {
        chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }
    }
    // New chat
    else {
        const title = await generateTitle(message);

        chat = await chatModel.create({
            user: req.user.id,
            title
        });
    };

    const currentChatId = chatId || chat._id;


    const userMessage = await messageModel.create({
        chat: currentChatId,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({ chat: currentChatId });

    const result = await generateResponse(messages);

    const AiMessages = await messageModel.create({
        chat: currentChatId,
        content: result,
        role: "AI"
    })

    return res.status(200).json({
        title,
        chat,
        AiMessages
    });

};


export const getChats = async (req, res) => { 
    const user = req.user;

    const chats = await chatModel.find({ user: user.id });

    return res.status(200).json({
        message: "chats retrieved successfully",
        chats
    });
};


export const getMessages = async (req, res) => {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    });
    
    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        });
    };

    const messages = await messageModel.find({ chat: chatId });

    return res.status(200).json({
        message: "messages retrieved successfully",
        messages
    });
    
};


export const deleteChat = async (req, res) => { 
    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    });

    await messageModel.deleteMany({
        chat: chatId
    });

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        });
    };

    return res.status(200).json({
        message: "Chat deleted successfully"
    });

};