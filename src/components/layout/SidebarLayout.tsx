"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { ReactNode } from "react";

export function SidebarLayout({ sidebar, children }: {
    sidebar: ReactNode,
    children: ReactNode,
}) {
    const segments = useSelectedLayoutSegments();
    const preferSidebar = segments.length === 0;

    return <div>
        <div className={`${preferSidebar ? "w-full" : "hidden md:block"} md:fixed top-0 left-0 bottom-0 md:w-96 md:p-8 min-h-screen md:h-screen`}>
            <div className="w-full min-h-screen md:min-h-0 md:h-full md:bg-neutral-100 dark:md:bg-neutral-900 md:rounded-2xl relative md:overflow-auto">
                {sidebar}
            </div>
        </div>
        <div className={`${preferSidebar ? "hidden md:block" : "w-full md:w-auto"} md:ml-96`}>
            {children}
        </div>
    </div>;
}