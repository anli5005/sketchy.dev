import prisma from "@/lib/prisma";
import f2l, { base64url, unbase64url } from "../f2l";
import { Fido2AssertionResult, Fido2AttestationResult } from "fido2-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const json = await request.json();

    // TODO: Validate JSON

    const { id, assertion } = json;

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
            ...assertion,
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

    // TODO: Issue auth token
    return NextResponse.json({ ok: true });
}