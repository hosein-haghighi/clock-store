import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL; // مثلا: https://your-app.onrender.com

async function proxy(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const path = pathSegments.join("/");
    const url = `${BACKEND_URL}/api/v1/${path}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("content-length");

    const res = await fetch(url, {
        method: req.method,
        headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
        // @ts-expect-error لازم برای استریم کردن body در Node runtime (آپلود عکس محصولات و ...)
        duplex: "half",
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

export {
    proxy as GET,
    proxy as POST,
    proxy as PUT,
    proxy as PATCH,
    proxy as DELETE,
};