import { io } from "socket.io-client";


let socket = null;

export const initSocketConnection = (onChunkReceived, onChatCreated) => { 
    if (!socket) {
        socket = io("http://localhost:3000", {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Connected to socket.io server");
        });
    }

    if (onChunkReceived) {
        socket.off("chatChunk");
        socket.on("chatChunk", (data) => {
            onChunkReceived(data);
        });
    }

    if (onChatCreated) {
        socket.off("chatCreated");
        socket.on("chatCreated", (data) => {
            onChatCreated(data);
        });
    }

    return socket;
};

export const joinChatRoom = (chatId) => {
    if (socket && chatId) {
        socket.emit("joinChat", chatId);
    }
};