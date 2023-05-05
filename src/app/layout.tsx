import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata = {
    title: "sketchy.dev",
    description: "a website",
};

export default function RootLayout({
    children,
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
