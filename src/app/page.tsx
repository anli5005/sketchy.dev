import { LogIn } from "@/components/auth/LogIn";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
    const user = await getUser();

    if (user) {
        const space = await prisma.space.findFirst({
            where: {
                users: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        if (space) {
            redirect(`/manage/space/${encodeURIComponent(space.slug)}`);
        } else {
            redirect("/manage");
        }
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center space-y-4">
            <h1>sketchy.dev</h1>
            <LogIn />
        </main>
    );
}
