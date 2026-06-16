import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

const register = async (req, res) => {
  const { username, password, email } = req.body;

  // Validation is handled by the registerValidator middleware.
  return res.status(201).json({
    message: "Registration data is valid",
    user: { username, email },
  });
};

export { register };

