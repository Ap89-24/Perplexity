import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateResponse, generateTitle } from "../services/ai.service.js";





export const sendMessage = async (req, res) => { 
    const { message, chat: chatId } = req.body;
    
    
    let title=null, chat=null;
    
    if (!chatId) {
        
         title = await generateTitle(message);
        
         chat = await chatModel.create({
            user: req.user.id,
            title
        });
    };
    
    
    const userMessage = await messageModel.create({
        chat: chatId || chat.id,
        content: message,
        role: "user"
    })
    
    const messages = await messageModel.find({ chat: chatId });
    console.log(messages)

    // const result = await generateResponse(message);

    // const AiMessages = await messageModel.create({
    //     chat: chat.id,
    //     content: result,
    //     role: "AI"
    // })

    // return res.status(200).json({
    //     AIResponse: result,
    //     title,
    //     chat,
    //     userMessage,
    //     AiMessages
    // });

};




