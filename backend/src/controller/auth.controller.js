const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function registerController(req, res) {
  const { userName, email, password } = req.body;

  // fetching user
  const IsUserExist = await userModel.findOne({
    $or: [{ userName }, { email }],
  });

  // if user already exist
  if (IsUserExist) {
    return res.status(409).json({
      message: "User with same username or email already exist",
    });
  }

  // password hashed
  const hashPassword = await bcrypt.hash(password, 10);

  // creating new user
  const user = await userModel.create({
    userName,
    password: hashPassword,
    email,
  });

  // token created
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  // token send
  res.cookie("token", token);

  // remove password from respone
  const userSafe = user.toObject();
  delete userSafe.password;

  // register response
  res.status(201).json({
    message: "New user is created",
    user: userSafe,
  });
}

async function loginController(req, res) {
  const { email, password } = req.body;

  // fetch user
  const user = await userModel
    .findOne({
      email,
    })
    .select("+password");

  // if user not exist
  if (!user) {
    return res.status(401).json({
      message: "User with this email id doesn't exist",
    });
  }

  // check password is correct or not
  const passwordCheck = bcrypt.compare(password, user.password);

  // if password is invalid
  if (!passwordCheck) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }

  // token create and send
  const token = jwt.sign({ id: user._id }.process.env.JWT_SECRET);
  res.cookie("token", token);

  // remove password from response
  const userSafe = user.toObject();
  delete userSafe.password;

  // login response
  res.status(200).json({
    message: "Login Successfull",
    user: userSafe,
  });
}

function logoutController(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
}

module.exports = { registerController, loginController, logoutController };
