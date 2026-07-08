import { initSocketConnection } from "../services/chat.socket.js";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api.js";
import { setChats, setCurrentChatId, setIsLoading, setError, createNewChat, addNewMessage, addMessages } from "../chat.slice.js";
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

        dispatch(addNewMessage({
            chatId: chat._id,
            content: message,
            role: "user"
        }));

        dispatch(addNewMessage({
            chatId: chat._id,
            content: AiMessages.content,
            role: "AI"
        }));
        dispatch(setCurrentChatId(chat._id));
    };

    const handleGetChats = async () => { 
        dispatch(setIsLoading(true));
        const data = await getChats();
        const { chats } = data;
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt
            };
            return acc;
        }, {})))
        dispatch(setIsLoading(false));
    };

    const handleOpenChat = async (chatId) => { 
        dispatch(setIsLoading(true));
        const data = await getMessages(chatId);
        const { messages } = data;

        const formattedMessage = messages.map(msg => ({
            content: msg.content,
            role: msg.role
        }));
        dispatch(addMessages({
            chatId,
            messages: formattedMessage
        }));
        dispatch(setCurrentChatId(chatId));
        dispatch(setIsLoading(false));
    };
    return {
        initSocketConnection,
        handleSendMesage,
        handleGetChats,
        handleOpenChat
    }
};