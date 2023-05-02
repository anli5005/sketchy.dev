import { LogIn } from "@/components/auth/LogIn";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center space-y-4">
            <h1>sketchy.dev</h1>
            <LogIn />
        </main>
    );
}
