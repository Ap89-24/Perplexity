import { initSocketConnection } from "../services/chat.socket.js";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api.js";
import { setChats, setCurrentChatId, setIsLoading, setError } from "../chat.slice.js";
import { useDispatch } from "react-redux";



export const useChat = () => { 

    const dispatch = useDispatch();

    const handleSendMesage = async ({ message, chatId }) => { 
        dispatch(setIsLoading(true));
        const data = await sendMessage({ message, chatId });
        const { chat, AiMessages } = data;
        dispatch(setChats((prev) => {
            return {
                ...prev,
                [chat.title]: {
                    ...chat,
                    message: [{ content: message, role: "user" }, AiMessages]
                },
            }
        }));
        dispatch(setCurrentChatId(chat._id));
    };
    return {
        initSocketConnection,
        handleSendMesage
    }
};