"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogInState = {
    status: "idle",
} | {
    status: "loading-challenge",
} | {
    status: "ready-for-credential",
} | {
    status: "authenticating",
} | {
    status: "error",
    isRegistering: boolean,
    error: string,
} | {
    status: "invite-only",
    isRegistering: boolean,
    keyId: string,
};

function base64url(buffer: ArrayBuffer) {
    const b64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function LogIn() {
    const router = useRouter();

    const [state, setState] = useState<LogInState>({
        status: "idle",
    });

    const login = async () => {
        setState({
            status: "loading-challenge",
        });

        try {
            const response = await fetch("/api/auth/challenge", {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Failed to load challenge");
            }

            const { id, challenge } = await response.json();

            setState({
                status: "ready-for-credential",
            });

            // Convert the challenge from a hex string to a Uint8Array
            const challengeArray = new Uint8Array(challenge.length / 2);
            for (let i = 0; i < challenge.length; i += 2) {
                challengeArray[i / 2] = parseInt(challenge.slice(i, i + 2), 16);
            }

            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: challengeArray,
                    timeout: 4 * 60 * 1000,
                    userVerification: "preferred",
                },
            }) as (PublicKeyCredential & { response: AuthenticatorAssertionResponse }) | null;

            if (!credential) throw new Error("Failed to create credential");

            setState({
                status: "authenticating",
            });

            const credentialResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    assertion: {
                        id: credential.id,
                        response: {
                            clientDataJSON: base64url(credential.response.clientDataJSON),
                            authenticatorData: base64url(credential.response.authenticatorData),
                            signature: base64url(credential.response.signature),
                        },
                    },
                }),
            });

            if (!credentialResponse.ok) {
                throw new Error("Failed to register");
            }

            const { id: keyId, userFound } = await credentialResponse.json();

            if (userFound) {
                router.refresh();
            } else {
                setState({
                    status: "invite-only",
                    isRegistering: false,
                    keyId,
                });
            }
        } catch (e: any) {
            console.error(e);
            setState({
                status: "error",
                isRegistering: true,
                error: e.message,
            });
        }
    };

    const register = async () => {
        setState({
            status: "loading-challenge",
        });

        try {
            const response = await fetch("/api/auth/challenge", {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Failed to load challenge");
            }

            const { id, challenge } = await response.json();

            setState({
                status: "ready-for-credential",
            });

            // Convert the challenge from a hex string to a Uint8Array
            const challengeArray = new Uint8Array(challenge.length / 2);
            for (let i = 0; i < challenge.length; i += 2) {
                challengeArray[i / 2] = parseInt(challenge.slice(i, i + 2), 16);
            }

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challengeArray,
                    rp: {
                        name: process.env.NEXT_PUBLIC_RP_NAME ?? "sketchy.dev",
                        id: process.env.NEXT_PUBLIC_RP_ID ?? "sketchy.dev",
                    },
                    user: {
                        id: new TextEncoder().encode(id),
                        name: id,
                        displayName: id,
                    },
                    pubKeyCredParams: [
                        {
                            alg: -7,
                            type: "public-key",
                        },
                    ],
                    authenticatorSelection: {
                        userVerification: "preferred",
                    },
                    timeout: 4 * 60 * 1000,
                    attestation: "none",
                },
            }) as (PublicKeyCredential & { response: AuthenticatorAttestationResponse }) | null;

            if (!credential) throw new Error("Failed to create credential");

            setState({
                status: "authenticating",
            });

            const credentialResponse = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    attestation: {
                        id: credential.id,
                        response: {
                            clientDataJSON: base64url(credential.response.clientDataJSON),
                            attestationObject: base64url(credential.response.attestationObject),
                        },
                    },
                }),
            });

            if (!credentialResponse.ok) {
                throw new Error("Failed to register");
            }

            setState({
                status: "invite-only",
                isRegistering: true,
                keyId: id,
            });
        } catch (e: any) {
            console.error(e);
            setState({
                status: "error",
                isRegistering: true,
                error: e.message,
            });
        }
    };

    if (state.status === "idle") {
        return <div className="flex flex-col justify-center items-center space-y-2 text-center">
            <button type="button" onClick={login}>Log in with passkey</button>
            <button type="button" onClick={register}>Create new passkey</button>
        </div>;
    }

    if (state.status === "error") {
        return <div className="flex flex-col justify-center items-center space-y-2 text-center">
            <h2>Something went wrong</h2>
            <p>{state.error}</p>
            <button onClick={() => {
                setState({
                    status: "idle",
                });
            }} type="button">Try again</button>
        </div>;
    }

    if (state.status === "invite-only") {
        return <div className="flex flex-col justify-center items-center space-y-2 text-center">
            <h2>{state.isRegistering ? "Passkey created!" : "Authentication successful"}</h2>
            <p>sketchy.dev is invite-only. To proceed, provide your key ID to an admin:</p>
            <p className="font-mono">{state.keyId}</p>
        </div>;
    }

    if (state.status === "loading-challenge") {
        return <div>Requesting authentication challenge...</div>;
    }

    if (state.status === "ready-for-credential") {
        return <div>Follow your browser&rsquo;s instructions to continue.</div>;
    }

    if (state.status === "authenticating") {
        return <div>Verifying challenge response...</div>;
    }

    return <div>One moment...</div>;
}