const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function registerController(req, res) {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "userName, email and password are required",
      });
    }

    const existingUser = await userModel.findOne({
      $or: [{ userName }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with same username or email already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      userName,
      password: hashPassword,
      email,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, cookieOptions);

    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(201).json({
      message: "New user is created",
      user: userSafe,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "User with this email id doesn't exist",
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, cookieOptions);

    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(200).json({
      message: "Login Successful",
      user: userSafe,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: error.message || "Server error during login",
    });
  }
}

function logoutController(req, res) {
  try {
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
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await userModel.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

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
