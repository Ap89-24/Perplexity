import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.route.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());







export default app;