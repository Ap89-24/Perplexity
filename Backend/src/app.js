import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";


const app = express();


/* 
@description -> these all are middlewares.....
*/
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET" , "POST" , "PUT" , "DELETE"]
    })
);



/* 
@description -> Api's for auth....
*/

app.use("/api/auth", authRouter);

/* 
@description -> Api's for chat....
*/

app.use("/api/chats" , chatRouter);










export default app;