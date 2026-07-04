import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
});


export const sendMessage = async (message, chatId) => { 
    try {
        const response = await api.post("/api/chats/message", {
            message,
            chatId
        });

        return response.data;
    } catch (error) {
        console.error("Error sending message: ", error);
    }
};


export const getChats = async () => { 
    try {
        const response = await api.get("api/chats/");
        return response.data;
    } catch (error) {
        console.error("Error in fetching chats: ", error);
    }
};


export const getMessages = async (chatId) => { 
    try {
        const response = await api.get(`/api/chats/${chatId}/messages`);
        return response.data;
    } catch (error) {
        console.error("Error in fetching messages: ", error);
    }
};


export const deleteChat = async (chatId) => { 
    try {
        const response = await api.delete(`/api/chats/delete/${chatId}`);
        return response.data;
    } catch (error) {
        console.error("Error in deleting chat: ", error);
    }
};