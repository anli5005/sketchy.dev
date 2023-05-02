import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params: { slug } }: { params: { slug: string } }) {
    if (slug.startsWith("@")) {
        const destination = `${process.env.EXPECTED_ORIGIN ?? "https://sketchy.dev"}/manage/space/${encodeURIComponent(slug.slice(1))}`;
        return NextResponse.redirect(destination, { status: 301 });
    }
    
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