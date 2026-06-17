import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../services/mail.service.js";

const register = async (req, res) => {
  const { username, password, email } = req.body;

  // Validation is handled by the registerValidator middleware.
  const isUserAlreadtExsist = await userModel.findOne({
    $or: [
      { username },
      { email }
    ]
  });

  if (isUserAlreadtExsist) {
    return res.status(400).json({
      success: false,
      message: "Username or email already exists.",
      err: "User already exists"
    });
  };

  const user = await userModel.create({
    username,
    email,
    password
  });


  /* 
  @description: Send a welcome email to the newly registered user
  */
  await sendEmail({
    to: email,
    subject: "Welcome to Our Perplexity App!",
    html: `<h1>Welcome, ${username}!</h1>
    <p>Thank you for registering with our Perplexity App. We're excited to have you on board!</p>
    <p>Feel free to explore the app and let us know if you have any questions.</p>
    <p>Best regards,<br/>The Perplexity Team</p>
    `
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });

};
export { register };

