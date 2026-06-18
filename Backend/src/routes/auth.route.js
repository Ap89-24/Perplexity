import { Router } from "express";
import registerValidator from "../validators/register.validator.js";
import { register, verifyEmail } from "../controllers/auth.controller.js";
import loginValidator from "../validators/login.validator.js";

const authRouter = Router();


/* 
@description: Register a new user
@route: POST /api/auth/register
@access: Public
*/
authRouter.post("/register", registerValidator, register);



/* 
@description: Login an existing user
@route: POST /api/auth/login
@access: Public
@note: The login route will validate the user's credentials and return a JWT token if the login is successful.
*/
authRouter.post("/login" , loginValidator);


/* 
@description: Verify the user's email address
@route: GET /api/auth/verify-email          
@access: Public
@note: The verification link will contain a token that the user can click to verify their email address.
*/
authRouter.get("/verify-email" , verifyEmail);





export default authRouter;