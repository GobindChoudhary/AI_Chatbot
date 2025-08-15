const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Username is required"],
      minlenght: [2, "Username should have atleast 2 charecter"],
      maxlength: [20, "UserName should have atmax 20 charecter"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "E-mail is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Passowrd is required"],
      select: false,
      minlength: [8, "Password should have atleast 8 character"],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
