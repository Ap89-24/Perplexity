import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

const register = async (req, res) => {
  const { username, password, email } = req.body;

  // Validation is handled by the registerValidator middleware.
  const isUserAlreadtExsist = await userModel.findOne({
    $or: [
      { username },
      { email }
    ]
  });

  if(isUserAlreadtExsist){
    return res.status(400).json({
      success: false,
      message: "Username or email already exists.",
      err: "User already exists"
    });
  };

  
};

export { register };

