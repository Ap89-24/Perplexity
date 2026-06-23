import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../services/mail.service.js";
import jwt from "jsonwebtoken";

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


  const emailVerifyToken = jwt.sign({
    email: user.email
  }, process.env.JWT_SECRET)

  /* 
  @description: Send a welcome email to the newly registered user
  */
  await sendEmail({
    to: email,
    subject: "Welcome to Our Nexora App!",
    html: `<h1>Welcome, ${username}!</h1>
    <p>Thank you for registering with our Nexora App. We're excited to have you on board!</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerifyToken}">Verify Email</a>
    <p>Feel free to explore the app and let us know if you have any questions.</p>
    <p>Best regards,<br/>The Nexora Team</p>
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


const verifyEmail = async (req, res) => {

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required for email verification."
      });
    };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({
      email: decoded.email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token. User not found."
      });
    };

    user.verified = true;

    await user.save();

    const html = `
    <h1>Email Verified Successfully!</h1>
    <p>Thank you for verifying your email address. Your account is now active.</p>
    <p>You can now log in to the Nexora App and start exploring!</p>
    <p>Best regards,<br/>The Nexora Team</p>
    <a href="http://localhost:3000/login">Go to Login</a>
  `

    return res.status(200).send(html);
  } catch (err) {
    console.error("Error during email verification: ", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred during email verification.",
      error: err.message
    });
  };

};


const login = async (req, res) => {
  const {email, password} = req.body;

  const user = await userModel.findOne({
    email,
  });

  if(!user){
    return res.status(400).json({
      success: false,
      message: "Invalid email or password.",
      err: "User not found"
    });
  };

  const isPasswordValid = await user.comparePassword(password);

  if(!isPasswordValid){
    return res.status(400).json({
      success: false,
      message: "Invalid email or password.",
      err: "Incorrect password"
    });
  };

  /* 
  @description: Check if the user's email is verified before allowing them to log in.
  */
  if(!user.verified){
    return res.status(400).json({
      success: false,
      message: "Please verify your email before logging in.",
      err: "Email not verified"
    });
  };

  const token = jwt.sign({
    id: user.id,
    username: user.username
  } , process.env.JWT_SECRET , {
    expiresIn: "2d"
  });

  res.cookie("token" , token);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    },
  })
};


const getMe = async (req, res) => {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("-password");

  if(!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
      err: "User not found"
    });
  };

  res.status(200).json({
     success: true,
     message: "User details fetched successfully",
     user
  });
};

export { register, verifyEmail, login, getMe };

