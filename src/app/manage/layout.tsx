import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Sidebar() {
    const user = await getUser();
    if (!user) redirect("/");

    const spaces = await prisma.space.findMany({
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

    return <div className="flex flex-col min-h-screen md:min-h-0 h-full">
        <div className="sticky bottom-0 left-0 right-0 h-16 pb-4 px-4 mt-auto">
            <div className="w-full h-full rounded-xl bg-neutral-200 dark:bg-neutral-800 p-4 flex justify-center items-center space-x-2">
                <div className="grow">Hi, <strong>{user.name}</strong>!</div>
                <a href="/api/auth/logout"><i className="bi bi-door-open text-red-500" /><span className="sr-only">Log out</span></a>
            </div>
        </div>
    </div>;
}

export default async function ManageLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return <SidebarLayout sidebar={<Suspense fallback={<div className="w-full text-center h-full flex items-center justify-center flex-col">One moment...</div>}>
        {/* @ts-ignore */}
        <Sidebar />
    </Suspense>}>
        {children}
    </SidebarLayout>;
}