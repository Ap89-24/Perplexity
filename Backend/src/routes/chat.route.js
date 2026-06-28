import { Router } from "express";
import authUser from "../middleware/auth.middleware.js";
import { sendMessage } from "../controllers/chat.controller.js";



const chatRouter = Router();

/*
@description: Send a message to the AI chatbot
@route: POST /api/chats/message
@access: Private
@note: This endpoint allows an authenticated user to send a chat message. The AI processes the message and returns a generated response. Authentication is required using a valid JWT token.
*/
chatRouter.post("/message", authUser, sendMessage);


export default chatRouter;