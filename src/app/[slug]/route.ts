import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params: { slug } }: { params: { slug: string } }) {
    const link = await prisma.link.findUnique({
        where: {
            slug,
        },
        select: {
            id: true,
            url: true,
            clicks: true,
            maxClicks: true,
            expiresAt: true,
        },
    });

    if (!link) {
        return new Response("Not found", {
            status: 404,
        });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
        return new Response("Link expired", {
            status: 410,
        });
    }

    if (link.maxClicks && link.maxClicks <= link.clicks) {
        return new Response("Link expired", {
            status: 410,
        });
    }

    await prisma.link.update({
        where: {
            id: link.id,
        },
        data: {
            clicks: {
                increment: 1,
            },
        },
    });

    return NextResponse.redirect(link.url, {
        status: 308,
    });
}