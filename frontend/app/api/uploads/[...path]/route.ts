import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL; // مثلا: https://your-app.onrender.com

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const path = pathSegments.join("/");
    const url = `${BACKEND_URL}/${path}`;

    const res = await fetch(url, {
        redirect: "manual",
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("connection");
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(res.body, {
        status: res.status,
        headers: responseHeaders,
    });
}