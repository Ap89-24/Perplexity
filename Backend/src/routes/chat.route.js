import { Router } from "express";
import authUser from "../middleware/auth.middleware.js";
import { deleteChat, getChats, getMessages, sendMessage } from "../controllers/chat.controller.js";



const chatRouter = Router();

/*
@description: Send a message to the AI chatbot
@route: POST /api/chats/message
@access: Private
@note: This endpoint allows an authenticated user to send a chat message. The AI processes the message and returns a generated response. Authentication is required using a valid JWT token.
*/
chatRouter.post("/message", authUser, sendMessage);

/*
@description: Get all chats for the authenticated user
@route: GET /api/chats
@access: Private
@note: Returns all chat conversations created by the authenticated user, sorted by the most recently updated.
*/
chatRouter.get("/", authUser, getChats);


/*
@description: Get all messages of a specific chat
@route: GET /api/chats/:chatId/messages
@access: Private
@note: Returns all user and AI messages belonging to the specified chat. Only the chat owner can access the messages.
*/
chatRouter.get("/:chatId/messages", authUser, getMessages);


/*
@description: Delete a chat conversation
@route: DELETE /api/chats/delete/:chatId
@access: Private
@note: Deletes the specified chat along with all associated messages. Only the authenticated owner of the chat is authorized to perform this action.
*/
chatRouter.delete("/delete/:chatId", authUser, deleteChat);





export default chatRouter;