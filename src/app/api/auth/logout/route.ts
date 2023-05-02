import { NextResponse } from "next/server";

export function GET() {
    return NextResponse.redirect(process.env.EXPECTED_ORIGIN ?? process.env.VERCEL_URL ?? "https://sketchy.dev", {
        status: 302,
        headers: {
            "Set-Cookie": `sketchytoken=; Path=/; HttpOnly; SameSite=Strict; MaxAge=1${process.env.NODE_ENV === "development" ? "" : "; Secure"}`,
        },
    });
}