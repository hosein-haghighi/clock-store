import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { RefreshToken } from "../models/refreshTokenModel.js";
import type { ResType } from "../types/res.js";
import { getErrorMessage } from "../utils/errorHandler.js";
import type { RequestHandler } from "express";


export const refreshAccessToken: RequestHandler = async (req, res) => {

    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                status: "fail",
                message: "No refresh token provided",
            });
        }

        // Check token exists in DB first (before jwt.verify)
        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        // ── Reuse Detection ──────────────────────────────────────────
        // اگر token در DB نیست ولی JWT معتبره، یعنی قبلاً استفاده شده
        // → احتمال دزدیده شدن → همه session های این user رو نابود کن
        if (!storedToken) {
            try {
                const decoded = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_SECRET!
                ) as { id: string };

                // token معتبره ولی در DB نیست = reuse شده
                await RefreshToken.deleteMany({ userId: decoded.id });
            } catch {
                // token جعلی یا منقضیه، اهمیتی نداره
            }

            return res.status(401).json({
                status: "fail",
                message: "Invalid refresh token",
            });
        }

        // ── بررسی انقضا از DB ────────────────────────────────────────
        if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: storedToken._id });

            return res.status(401).json({
                status: "fail",
                message: "Refresh token expired",
            });
        }

        // ── تأیید امضای JWT ──────────────────────────────────────────
        let decoded: { id: string };
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET!
            ) as { id: string };
        } catch (err: any) {
            await RefreshToken.deleteOne({ _id: storedToken._id });

            return res.status(401).json({
                status: "fail",
                message:
                    err.name === "TokenExpiredError"
                        ? "Refresh token expired"
                        : "Invalid refresh token",
            });
        }

        // ── بررسی وجود کاربر ─────────────────────────────────────────
        const user = await User.findById(decoded.id).select("_id role");

        if (!user) {
            await RefreshToken.deleteMany({ userId: decoded.id });

            return res.status(401).json({
                status: "fail",
                message: "User no longer exists",
            });
        }

        // ── ساخت token های جدید ──────────────────────────────────────
        const newAccessToken = jwt.sign(
            { id: user._id },
            process.env.ACCESS_SECRET!,
            { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS!) }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_SECRET!,
            { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS!) }
        );

        // ── Rotation: قدیمی رو حذف، جدید رو ذخیره ───────────────────
        await RefreshToken.deleteOne({ _id: storedToken._id });
        await RefreshToken.create({
            userId: user._id,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS!)),
        });

        // ── Set cookies ───────────────────────────────────────────────
        const cookieBase = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };
        res.cookie("accessToken", newAccessToken, {
            ...cookieBase,
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS!)
        });

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieBase,
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS!)
        });

        return res.status(200).json({
            status: "success",
            message: "Tokens refreshed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: getErrorMessage(error)
        });
    }
};