import type { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import type { ResType } from "../types/res.js";
import { type Response } from "express"
export type ErrorCode =
    | "AUTHENTICATION_REQUIRED"
    | "TOKEN_EXPIRED"
    | "TOKEN_INVALID"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "USER_NOT_FOUND"
    | "VALIDATION_ERROR"
    | "INVALID_TOKEN"
    | "AUTHENTICATION_FAILED";

export interface AuthResType<T = unknown> {
    status: "success" | "fail";
    code?: ErrorCode;
    message?: string;
    data?: T;
}
export const protect = async (
    req: any,
    res: Response<AuthResType>,
    next: NextFunction
) => {
    try {

        // get token from http-only cookie
        const token = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        // check token exists
        if (!token && !refreshToken) {
            return res.status(401).json({
                status: "fail",
                code: "AUTHENTICATION_REQUIRED",
                message: "Not logged in",
            });
        }
        if (!token && refreshToken) {
            return res.status(401).json({
                status: "fail",
                code: "TOKEN_EXPIRED",
                message: "Token expired"
            });
        }

        // verify token
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_SECRET!
        ) as { id: string };

        // find user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                status: "fail",
                code: "USER_NOT_FOUND",
                message: "User no longer exists",
            });
        }

        // attach user to request
        req.user = user;

        next();
    } catch (error: any) {
        // token expired
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: "fail",
                code: "TOKEN_EXPIRED",
                message: "Token expired",
            });
        }

        // invalid token
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: "fail",
                code: "INVALID_TOKEN",
                message: "Invalid token",
            });
        }

        return res.status(500).json({
            status: "fail",
            code: "AUTHENTICATION_FAILED",
            message: "Authentication failed",
        });
    }
};

export const isUserAdmin = (
    req: any,
    res: Response<AuthResType>,
    next: NextFunction
) => {
    if (req.user?.role === "admin") {
        return next();
    }

    return res.status(403).json({
        status: "fail",
        code: "FORBIDDEN",
        message: "Forbidden",
    });
};