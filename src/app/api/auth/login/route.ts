import prisma from "@/lib/prisma";
import f2l, { base64url, unbase64url } from "../f2l";
import { Fido2AssertionResult } from "fido2-lib";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sign } from "jsonwebtoken";
import { InferType, ValidationError, object, string } from "yup";

const bodySchema = object({
    id: string().required(),
    assertion: object({
        id: string().required(),
        response: object({
            clientDataJSON: string().required(),
            authenticatorData: string().required(),
            signature: string().required(),
        }).required(),
    }).required(),
}).required();

export async function POST(request: Request) {
    const json = await request.json();
    let validated: InferType<typeof bodySchema>;

    try {
        validated = await bodySchema.validate(json, { strict: true });
    } catch (e: any) {
        if (e instanceof ValidationError) {
            return new Response(e.message, {
                status: 400,
            });
        } else {
            throw e;
        }
    }

    const { id, assertion } = validated;

    const challenge = await prisma.challenge.delete({
        where: {
            id,
        },
    });

    if (!challenge) {
        return new Response("Bad challenge ID", {
            status: 400,
        });
    }

    if (!assertion.id) {
        return new Response("Missing assertion ID", {
            status: 400,
        });
    }

    const publicKey = await prisma.publicKey.findUnique({
        where: {
            keyId: assertion.id,
        },
        include: {
            user: true,
        },
    });

    if (!publicKey) {
        return new Response("Unknown key ID", {
            status: 400,
        });
    }

    let assertionResult: Fido2AssertionResult;
    try {
        const idBuffer = unbase64url(assertion.id);
        assertionResult = await f2l.assertionResult({
            ...assertion as any,
            id: idBuffer.buffer.slice(idBuffer.byteOffset, idBuffer.byteOffset + idBuffer.byteLength),
        }, {
            challenge: base64url(challenge.bytes),
            origin: process.env.EXPECTED_ORIGIN ?? ((process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ?? "https://sketchy.dev"),
            factor: "either",
            publicKey: publicKey.keyData,
            prevCounter: publicKey.counter,
            userHandle: null,
        });
    } catch (e: any) {
        return new Response(`Bad assertion: ${e.message}`, {
            status: 400,
        });
    }

    await prisma.publicKey.update({
        where: {
            id: publicKey.id,
        },
        data: {
            counter: assertionResult.authnrData.get("signCount"),
        },
    });

    if (!publicKey.user) {
        return NextResponse.json({
            ok: true,
            id: publicKey.id,
            userFound: false,
        });
    }

    let tokenSubject: string;
    if (publicKey.user.tokenSubject) {
        tokenSubject = publicKey.user.tokenSubject;
    } else {
        tokenSubject = randomBytes(32).toString("base64");
        await prisma.user.update({
            where: {
                id: publicKey.user.id,
            },
            data: {
                tokenSubject,
            },
        });
    }

    if (!process.env.AUTH_SECRET) {
        throw new Error("Missing AUTH_SECRET");
    }

    const token = await new Promise<string>((resolve, reject) => {
        sign({
            sub: tokenSubject,
        }, process.env.AUTH_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1h",
        }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token!);
            }
        });
    });

    return NextResponse.json({
        ok: true,
        id: publicKey.id,
        userFound: true,
    }, {
        headers: {
            "Set-Cookie": `sketchytoken=${token}; Path=/; HttpOnly; SameSite=Strict; MaxAge=3600${process.env.NODE_ENV === "development" ? "" : "; Secure"}`,
        },
    });
}