"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isChildRoute } from "@/lib/utils";

export function SidebarLink({ href, children }: {
    href: string,
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isActive = isChildRoute(pathname, href);
    
    let colorClassNames;
    if (isActive) {
        colorClassNames = "bg-blue-500 text-white";
    } else {
        colorClassNames = "hover:bg-neutral-200 dark:hover:bg-neutral-800";
    }

    return <Link href={href}>
        <div className={`py-2 px-3 rounded-lg ${colorClassNames}`}>
            {children}
        </div>
    </Link>;
}