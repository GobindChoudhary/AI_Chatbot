const express = require("express");
const {
  registerController,
  loginController,
  logoutController,
  meController,
} = require("../controller/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);

module.exports = router;
