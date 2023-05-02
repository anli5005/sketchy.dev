import { LogIn } from "@/components/auth/LogIn";
import { getUser } from "@/lib/auth";

export default async function Home() {
    const user = await getUser();
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center space-y-4">
            <h1>sketchy.dev</h1>
            {user ? <>
                <h1>Hi, {user.name}!</h1>
                <a href="/api/auth/logout">Log out</a>
            </> : <LogIn />}
        </main>
    );
}
