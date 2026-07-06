import { initSocketConnection } from "../services/chat.socket.js";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api.js";
import { setChats, setCurrentChatId, setIsLoading, setError, createNewChat } from "../chat.slice.js";
import { useDispatch } from "react-redux";



export const useChat = () => { 

    const dispatch = useDispatch();

    const handleSendMesage = async ({ message, chatId }) => { 
        dispatch(setIsLoading(true));
        const data = await sendMessage({ message, chatId });
        const { chat, AiMessages } = data;
        dispatch(createNewChat({
            chatId: chat._id,
            title: chat.title
        }));
        dispatch(setCurrentChatId(chat._id));
    };
    return {
        initSocketConnection,
        handleSendMesage
    }
};