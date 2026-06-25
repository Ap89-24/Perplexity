import { initSocketConnection } from "../services/chat.socket.js";

export const useChat = () => { 
    return {
        initSocketConnection,
    }
};