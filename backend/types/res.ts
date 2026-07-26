import type { Response } from "express"


type ApiResponse<T = unknown> = {
    message: string
    status: "fail" | "success"
    code?: string,
    data?: T
    pagination?: {
        page: number,
        pages: number,
        total: number

    }
}

export interface ResType<T = unknown> {
    status: "success" | "fail";
    message?: string;
    data?: T;
}
