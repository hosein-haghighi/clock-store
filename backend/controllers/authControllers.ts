import type { Request, RequestHandler } from "express"
import { User } from "../models/userModel.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { RefreshToken } from "../models/refreshTokenModel.js";
import type { ResType } from "../types/res.js";
import { getErrorMessage } from "../utils/errorHandler.js";
export const changePasswordForgotten: RequestHandler = async (req, res) => {
    try {
        const { newPassword, passwordResetToken } = req.body;
        if (!passwordResetToken) {
            return (res.status(403).json({
                status: "fail",
                message: "no token!"
            }))
        }
        if (!newPassword) {
            return (res.status(403).json({
                status: "fail",
                message: "Where is your newPassword!!"
            }))
        }

        const decoded = await jwt.verify(passwordResetToken, process.env.ACCESS_SECRET!);
        if (typeof decoded === "string" || !("id" in decoded)) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid token payload",
            });
        }

        const user = await User.findOne({ _id: decoded.id });
        if (!user || user.passwordResetToken !== passwordResetToken) {
            return (res.status(403).json({
                status: "fail",
                message: "credential fail!"
            }))
        }
        if (!user) {
            return (res.status(403).json({
                status: "fail",
                message: "The user not found!"
            }))
        }
        if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
            return (res.status(403).json({
                status: "fail",
                message: "token is expired!"
            }))
        }
        user.password = newPassword
        delete user.passwordResetToken;
        delete user.passwordResetTokenExpiresAt;
        await user.save()
        res.status(200).json({
            status: "success",
            message: "password updated successfully"
        });
    } catch (error) {
        res.status(401).json({
            status: "fail",
            message: getErrorMessage(error)
        });
    }



}
export const forgotPassword: RequestHandler = async (req, res) => {

    const email = req.body.email

    try {
        const user = await User.findOne({ email });
        const expiresInMins = 5
        if (!user) {
            return res.status(400).json({
                message: `If account exists, reset instructions sent and the code will expires in ${expiresInMins}`,
                status: "fail"
            })
        }

        const id = user._id;
        const newPasswordResetToken = jwt.sign({ id, type: "password-reset" }, process.env.ACCESS_SECRET!, { expiresIn: "5m" })

        const newPasswordResetTokenExpiresAt = new Date(Date.now() + expiresInMins * 60 * 1000)

        user.passwordResetToken = newPasswordResetToken;
        user.passwordResetTokenExpiresAt = newPasswordResetTokenExpiresAt;
        await user.save()
        res.json({
            status: "success",
            data: {
                passwordResetToken: newPasswordResetToken,
                passwordResetTokenExpiresIn: expiresInMins
            },

            message: `If account exists, reset instructions sent and the code will expires in ${expiresInMins} minutes`
        });

    } catch (error) {
        res.status(401).json({ message: getErrorMessage(error) ?? error, status: "fail" });
    }

}
export const signup: RequestHandler = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "missing required fields",
            });
        }

        // check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                status: "fail",
                message: "email already exists",
            });
        }

        // create user safely
        const user = await User.create({
            name,
            email,
            password

            // role intentionally omitted
        });

        // create access token
        const accessToken = jwt.sign(
            {
                id: user._id,
            },
            process.env.ACCESS_SECRET!,
            {
                expiresIn: "1h",
            }
        );

        // create refresh token
        const refreshToken = jwt.sign(
            {
                id: user._id,
            },
            process.env.REFRESH_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        // store refresh token
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });


        // set cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS!)
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS!)
        });

        // safe express.Response<ResType>
        res.status(201).json({
            status: "success",
            message: "Happy to join us :)",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: "fail",
            message: getErrorMessage(error)
        });
    }
};
export const login: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "email or password missing",
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "invalid credentials",
            });
        }
        const isCorrect = await bcrypt.compare(password, user.password);
        if (!isCorrect) {
            return res.status(401).json({
                status: "fail",
                message: "invalid credentials",
            });
        }
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.ACCESS_SECRET!,
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_SECRET!,
            { expiresIn: "7d" }
        );

        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS!)
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS!)
        });
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        res.status(200).json({
            status: "success",
            message: user?.name ? `Welcome home dear ${user.name}` : `Welcome home`,
            data: safeUser,
        });
    } catch (error: any) {
        res.status(500).json({
            status: "fail",
            message: getErrorMessage(error)
        });
    }
};
export const logout: RequestHandler = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(200).json({ message: "Already logged out", status: "fail" });
        }

        await RefreshToken.findOneAndDelete({ token });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            message: "Logged out successfully",
            status: "fail"
        });

    } catch (err: any) {
        return res.status(500).json({
            message: err.message,
            status: "fail"
        });
    }
};