import { initSocketConnection, joinChatRoom } from "../services/chat.socket.js";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api.js";
import { setChats, setCurrentChatId, setIsLoading, setError, createNewChat, addNewMessage, appendStreamChunk, updateLastMessage, addMessages, removeChat } from "../chat.slice.js";
import { useDispatch } from "react-redux";



export const useChat = () => { 

    const dispatch = useDispatch();

    const handleInitSocket = () => {
        initSocketConnection(
            ({ chatId, chunk }) => {
                dispatch(appendStreamChunk({ chatId, chunk }));
            },
            ({ chat, userMessage }) => {
                joinChatRoom(chat._id);
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title
                }));
                dispatch(setCurrentChatId(chat._id));
                dispatch(addNewMessage({
                    chatId: chat._id,
                    content: userMessage,
                    role: "user"
                }));
                dispatch(addNewMessage({
                    chatId: chat._id,
                    content: "",
                    role: "AI"
                }));
            }
        );
    };

    const handleNewChat = () => {
        dispatch(setCurrentChatId(null));
    };

    const handleDeleteChat = async (chatId, e) => {
        if (e) e.stopPropagation();
        dispatch(removeChat(chatId));
        try {
            await deleteChat(chatId);
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const handleSendMesage = async ({ message, chatId }) => { 
        dispatch(setIsLoading(true));

        if (chatId) {
            joinChatRoom(chatId);
            dispatch(addNewMessage({
                chatId,
                content: message,
                role: "user"
            }));
            dispatch(addNewMessage({
                chatId,
                content: "",
                role: "AI"
            }));
        }

        const data = await sendMessage({ message, chatId });
        if (!data) {
            dispatch(setIsLoading(false));
            return;
        }

        const { chat, AiMessages } = data;
        const activeChatId = chat._id;

        if (!chatId) {
            joinChatRoom(activeChatId);
            dispatch(createNewChat({
                chatId: activeChatId,
                title: chat.title
            }));
            
            dispatch(setCurrentChatId(activeChatId));

            dispatch(updateLastMessage({
                chatId: activeChatId,
                content: AiMessages.content,
                role: "AI"
            }));
        } else {
            dispatch(updateLastMessage({
                chatId: activeChatId,
                content: AiMessages.content,
                role: "AI"
            }));
        }

        dispatch(setIsLoading(false));
    };

    const handleGetChats = async () => { 
        dispatch(setIsLoading(true));
        const data = await getChats();
        if (data && data.chats) {
            const { chats } = data;
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt
                };
                return acc;
            }, {})));
        }
        dispatch(setIsLoading(false));
    };

    const handleOpenChat = async (chatId) => { 
        dispatch(setIsLoading(true));
        joinChatRoom(chatId);
        const data = await getMessages(chatId);
        if (data && data.messages) {
            const { messages } = data;

            const formattedMessage = messages.map(msg => ({
                content: msg.content,
                role: msg.role
            }));
            dispatch(addMessages({
                chatId,
                messages: formattedMessage
            }));
        }
        dispatch(setCurrentChatId(chatId));
        dispatch(setIsLoading(false));
    };

    return {
        initSocketConnection: handleInitSocket,
        handleSendMesage,
        handleGetChats,
        handleOpenChat,
        handleNewChat,
        handleDeleteChat
    }
};