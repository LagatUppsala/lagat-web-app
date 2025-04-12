import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    console.log("🔁 Proxying image request for:", url); // <--- log shows every time browser hits the proxy

    if (!url) {
        return new Response("Missing URL", { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        const contentType = response.headers.get("Content-Type") || "image/jpeg";
        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err) {
        console.error("❌ Failed to fetch image:", err);
        return new Response("Failed to fetch image", { status: 500 });
    }
}
