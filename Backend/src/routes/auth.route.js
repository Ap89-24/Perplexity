import { Router } from "express";
import registerValidator from "../validators/register.validator.js";
import { register, verifyEmail } from "../controllers/auth.controller.js";

const authRouter = Router();


/* 
@description: Register a new user
@route: POST /api/auth/register
@access: Public
*/
authRouter.post("/register", registerValidator, register);



/* 
@description: Verify the user's email address
@route: GET /api/auth/verify-email          
@access: Public
*/
authRouter.get("/verify-email" , verifyEmail);





export default authRouter;