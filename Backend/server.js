import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/sockets/server.socket.js";


const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 3000;

connectDB();

httpServer.listen(PORT , () => {
    console.log(`Server in running on port ${PORT}`);
})