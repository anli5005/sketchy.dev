import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import f2l from "../f2l";

export async function GET(_request: Request) {
    const options = await f2l.assertionOptions();
    const buffer = Buffer.from(options.challenge);

    const { id } = await prisma.challenge.create({
        data: {
            bytes: buffer,
        },
    });

    // Some housekeeping: Delete challenges created more than 5 minutes ago.
    await prisma.challenge.deleteMany({
        where: {
            createdAt: {
                lt: new Date(Date.now() - 5 * 60 * 1000),
            },
        },
    });

    return NextResponse.json({
        id,
        challenge: buffer.toString("hex"),
    });
}