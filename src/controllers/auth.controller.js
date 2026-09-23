import AsyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";

export const RegisterUser = AsyncHandler(async (req, res) => {
    const { username, email, password,role } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }
    const normlizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({
        $or: [
            { email: normlizedEmail },
            { username: username.trim() },
        ],
    });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const user = await User.create({
        username,
        email,
        password,
        role,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),

        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
})

export const LoginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        res.status(401);
        throw new Error("Invalid email or password");
    }
    res.status(200).json({
        message: "Login successful",
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),

    });
})

export const ForgotPassword = AsyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
        validateBeforeSave: false
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset",
        html: `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">
                Reset Password
            </a>
            <p>This link will expire in 10 minutes.</p>
        `,
    });
    res.status(200).json({
        success: true,
        message: "Password reset email sent",
    });
})

export const ResetPassword = AsyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
        res.status(400);
        throw new Error("Please provide token and password");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    });

    if (!user) {
        res.status(400);
        throw new Error("Invalid or expired reset token");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful",
    });
});