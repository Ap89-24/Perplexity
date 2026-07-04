import { initSocketConnection } from "../services/chat.socket.js";
import { sendMessage , getChats , getMessages , deleteChat } from "../services/chat.api.js";


export const useChat = () => { 
    return {
        initSocketConnection,
    }
};