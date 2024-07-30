const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/jwtMiddleWare");
const hashPassword = require("../utils/helper");
const router = express.Router();

require("dotenv").config();

const JWT_SEECRETKEY = process.env.JWT_SEECRETKEY;

function generateToken(user) {
  return jwt.sign(user, JWT_SEECRETKEY);
}

router.post("/signup", async (req, res) => {
  const data = req.body;

  const adminUser = await User.findOne({ role: 'admin' });
  if (data.role === 'admin' && adminUser) {
      return res.status(400).json({ error: 'Admin user already exists' });
  }

  const hashedPassword = hashPassword.hashPassword(data.password);

  data.password = hashedPassword;

  const newUser = await User.create(data);

  res.status(200).json({ newUser });

  console.log(newUser);
});

router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    if (!user) {
      res.status(404).send({ msg: "invalid aadhar card number" });
    }

    const isValid = await hashPassword.comparePassword(password, user.password);

    if (!isValid) {
      res.status(404).send({ msg: "invalid password" });
    }

    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);

    console.log("generated token is : ", token);

    res.status(200).send({ msg: "Login successful", token: token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ mesg: "internal server error" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    const userId = user.id;

    const userData = await User.findById(userId);
    console.log("userData", userData);
    res.status(200).send({ userdata: userData });
  } catch (error) {
    console.log(error);
    res.status(404).send({ msg: "internal json error" });
  }
});

router.put("/profile/password", verifyToken, async (req, res) => {
  try {
    const userId = req.user;

    const { currentPassword, newPassword } = req.body;

    console.log("currentPassword, newPassword", currentPassword, newPassword);

    console.log("userId", userId.id);

    const user = await User.findById(userId.id);

    console.log("user", user);

    // Compare the current password with the stored hash
    const isValid = await hashPassword.comparePassword(
      currentPassword,
      user.password
    );

    console.log("isValid", isValid);

    if (!isValid) {
      return res.status(400).send({ msg: "Invalid current password" });
    }

    // Hash the new password
    const hashedPassword = await hashPassword.hashPassword(newPassword);

    // Update the user's password
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    console.log("password updated");

    res.status(200).send({ msg: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = router;
