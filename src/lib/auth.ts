import { User } from "@prisma/client";
import { JwtPayload, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

export async function getUser(request?: Request): Promise<User | undefined> {
    if (!process.env.AUTH_SECRET) {
        throw new Error("Missing AUTH_SECRET");
    }
    
    let token: string | undefined;

    if (request) {
        token = request.headers.get("authorization")?.replace(/^Bearer /, "");
        if (!token) {
            token = request.headers.get("cookie")?.split("; ").find(cookie => cookie.startsWith("sketchytoken="))?.replace(/^sketchytoken=/, "");
        }
    } else {
        token = cookies().get("sketchytoken")?.value;
    }

    if (!token) return undefined;

    const decoded = await new Promise<JwtPayload | undefined>(resolve => {
        return verify(token!, process.env.AUTH_SECRET!, {
            algorithms: ["HS256"],
        }, (err, decoded) => {
            if (err || typeof decoded !== "object") {
                resolve(undefined);
            } else {
                resolve(decoded);
            }
        });
    });

    if (!decoded) return undefined;

    return await prisma.user.findUnique({
        where: {
            tokenSubject: decoded.sub!,
        },
    }) ?? undefined;
}