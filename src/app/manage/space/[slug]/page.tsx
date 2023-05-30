import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function Space({ params }: {
    params: { slug: string },
}) {
    const user = await getUser();
    if (!user) redirect("/");

    const space = await prisma.space.findFirst({
        where: {
            slug: params.slug,
            users: {
                some: {
                    userId: user.id,
                },
            },
        },
    });

    if (!space) notFound();
    
    return <div className="py-8">
        <h1 className="text-5xl font-bold mb-2">{space.name}</h1>
        <div className="opacity-50">More stuff coming soon...</div>
    </div>;
}