import { Fido2Lib } from "fido2-lib";

const f2l = new Fido2Lib({
    timeout: 5 * 60 * 1000,
    rpId: process.env.NEXT_PUBLIC_RP_ID,
    rpName: process.env.NEXT_PUBLIC_RP_NAME,
    challengeSize: 128,
    attestation: "none",
    cryptoParams: [-7, -257],
});

export default f2l;

export function base64url(buffer: Buffer) {
    return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function unbase64url(str: string) {
    return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}