import type { Request } from "express"
import { User } from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { RefreshToken } from "../models/refreshTokenModel.js"
import type { ResType } from "../types/res.js"
import { getErrorMessage } from "../utils/errorHandler.js"
import { type Response } from "express"
export const getUsers = async (req: Request, res: Response<ResType>) => {

    try {
        const users = await User.find()
        res.status(200).json({
            data: users,
            message: "getting users successfully",
            status: "success"
        })
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: getErrorMessage(error)
        })
    }
}
export const getMe = async (req: any, res: Response<ResType>) => {
    try {
        const user = req.user
        res.status(200).json({
            data: user,
            message: "get user was successful",
            status: "success"
        })
    } catch (error) {
        res.status(500).json({

            message: getErrorMessage(error),
            status: "fail"
        })
    }
}
export const updateMe = async (req: any, res: Response<ResType>) => {
    try {
        const { name, avatar, addresses } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, avatar, addresses },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: updatedUser,
            message: "user updated successfully"
        });

    } catch (error: any) {
        res.status(500).json({
            status: "fail",
            message: error?.message ?? "Server error",
        });
    }
};
export const changePassword = async (req: any, res: Response<ResType>) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }

        const isCorrect = await bcrypt.compare(currentPassword, user.password);

        if (!isCorrect) {
            return res.status(401).json({
                status: "fail",
                message: "current password is incorrect"
            });
        }

        // revoke session first
        const token = req.cookies?.refreshToken;

        if (token) {
            await RefreshToken.findOneAndDelete({ token });

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            });
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            });
        }

        // then change password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "password updated successfully"
        });

    } catch (error: any) {
        return res.status(500).json({
            status: "fail",

            message: error?.message ?? error
        });
    }
};