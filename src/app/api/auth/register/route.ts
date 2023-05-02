import prisma from "@/lib/prisma";
import f2l, { base64url, unbase64url } from "../f2l";
import { Fido2AttestationResult } from "fido2-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const json = await request.json();

    // TODO: Validate JSON

    const { id, attestation } = json;
    
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

    if (!attestation.id) {
        return new Response("Missing attestation ID", {
            status: 400,
        });
    }

    let attestationResult: Fido2AttestationResult;
    try {
        const idBuffer = unbase64url(attestation.id);
        attestationResult = await f2l.attestationResult({
            ...attestation,
            id: idBuffer.buffer.slice(idBuffer.byteOffset, idBuffer.byteOffset + idBuffer.byteLength),
        }, {
            challenge: base64url(challenge.bytes),
            origin: process.env.EXPECTED_ORIGIN ?? ((process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ?? "https://sketchy.dev"),
            factor: "either",
        });
    } catch (e: any) {
        return new Response(`Bad assertion: ${e.message}`, {
            status: 400,
        });
    }

    const keyData = attestationResult.authnrData.get("credentialPublicKeyPem");

    if (!keyData) {
        return new Response("Missing key data", {
            status: 400,
        });
    }

    await prisma.publicKey.create({
        data: {
            id,
            keyId:attestation.id,
            keyData,
        },
    });
    
    // TODO: Issue auth token
    return NextResponse.json({ ok: true });
}