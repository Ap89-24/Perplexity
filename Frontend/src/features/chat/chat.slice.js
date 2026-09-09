import { createSlice } from "@reduxjs/toolkit";


const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[chatId] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString()
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload
            if (state.chats[chatId]) {
                state.chats[chatId].messages.push({ content, role });
            }
        },
        appendStreamChunk: (state, action) => {
            const { chatId, chunk } = action.payload;
            if (state.chats[chatId]) {
                const messages = state.chats[chatId].messages;
                if (messages.length > 0 && messages[messages.length - 1].role === "AI") {
                    messages[messages.length - 1].content += chunk;
                } else {
                    messages.push({ content: chunk, role: "AI" });
                }
            }
        },
        updateLastMessage: (state, action) => {
            const { chatId, content, role } = action.payload;
            if (state.chats[chatId]) {
                const messages = state.chats[chatId].messages;
                if (messages.length > 0) {
                    messages[messages.length - 1] = { content, role };
                }
            }
        },
        addMessages: (state, action) => { 
            const { chatId, messages } = action.payload
            if (state.chats[chatId]) {
                state.chats[chatId].messages = messages;
            }
        },
        removeChat: (state, action) => {
            const chatId = action.payload;
            delete state.chats[chatId];
            if (state.currentChatId === chatId) {
                state.currentChatId = null;
            }
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
});


export const { setChats, setCurrentChatId, setIsLoading, setError, createNewChat, addNewMessage, appendStreamChunk, updateLastMessage, addMessages, removeChat } = chatSlice.actions;
export default chatSlice.reducer;