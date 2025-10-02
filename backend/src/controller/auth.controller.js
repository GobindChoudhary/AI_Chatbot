const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function  registerController(req, res) {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ message: "userName, email and password are required" });
    }

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

    // token created (7 days)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // send token as cookie
    res.cookie("token", token, cookieOptions);

    // remove password from respone
    const userSafe = user.toObject();
    delete userSafe.password;

    // register response
    return res.status(201).json({
      message: "New user is created",
      user: userSafe,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Server error during registration" });
  }
}

async function loginController(req, res) {
  try {
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
    const passwordCheck = await bcrypt.compare(password, user.password);

    // if password is invalid
    if (!passwordCheck) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // token create and send (7 days)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);

    // remove password from response
    const userSafe = user.toObject();
    delete userSafe.password;

    // login response
    return res.status(200).json({
      message: "Login Successfull",
      user: userSafe,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Server error during login" });
  }
}

function logoutController(req, res) {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };
    res.clearCookie("token", cookieOptions);
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

async function meController(req, res) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await userModel.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  registerController,
  loginController,
  logoutController,
  meController,
};
