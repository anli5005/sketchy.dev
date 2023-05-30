import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { InferType, ValidationError, object, string } from "yup";
import { blockedSlugs, maxLength, minLength, validSlugRegex } from "@/lib/blockedslugs";
import { getUser } from "@/lib/auth";

const bodySchema = object({
    slug: string().required().min(minLength).max(maxLength).matches(validSlugRegex).notOneOf(blockedSlugs),
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

    const user = await getUser(request);
    if (!user) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const existingSpaceCount = await prisma.space.count({
        where: {
            slug: validated.slug,
        },
    });

    if (existingSpaceCount > 0) {
        return new Response("Space already exists", {
            status: 409,
        });
    }

    const space = await prisma.space.create({
        data: {
            slug: validated.slug,
            name: validated.slug,
            users: {
                create: [
                    {
                        userId: user.id,
                    },
                ],
            },
        },
    });

    return NextResponse.json({
        ok: true,
        id: space.id,
    });
}