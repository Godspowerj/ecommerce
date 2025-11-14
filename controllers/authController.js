import usersDetails from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/sendEmail.js";

export const SignupController = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existingUser = await usersDetails.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const newUser = await usersDetails.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    const token = jwt.sign(
      { id: newUser._id, username, email, role },
      process.env.JWT_SECRET
    );

    await sendEmail({
      to: email,
      subject: "Welcome to Our App 🎉",
      html: `
        <h2>Hello ${username},</h2>
        <p>Welcome to our platform! We're so happy to have you onboard 🚀</p>
      `,
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    next(new Error("User registration failed"), 400);
  }
};


export const LoginController = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await usersDetails.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role,  email: user.email },
      process.env.JWT_SECRET
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(new Error("Login failed"), 400);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await usersDetails.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    user.password = hashedPassword;

    //save the updated user password
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset Successful 🔒",
      html: `
        <h2>Hello ${user.username},</h2>
        <p>Your password has been successfully reset. If you did not initiate this change, please contact our support team immediately.</p>
        <p>Stay safe!</p>
      `,
    });
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(new Error("Failed to reset password"));
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const user = await usersDetails.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });

    await sendEmail({
      to: user.email,
      subject: "Password Change Notification 🔔",
      html: `
        <h2>Hello ${user.username},</h2>
        <p>This is a confirmation that your password has been changed successfully. If you did not make this change, please contact our support team immediately.</p>
        <p>Stay secure!</p>
      `,
    });
  } catch (error) {
    next(new Error("Failed to change password"));
  }
};
