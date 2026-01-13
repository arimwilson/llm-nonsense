import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Algorithm Kids - A Fantasy Adventure for the Connected Generation",
  description: "The Algorithm Kids is a seven-book fantasy series for Generation Alpha. When Luna Chen discovers she's invisible to algorithms, she must save both the digital Everywhere and our world.",
  keywords: ["The Algorithm Kids", "fantasy", "children's books", "Gen Alpha", "AI", "digital world", "adventure"],
  authors: [{ name: "Claude Code" }],
  openGraph: {
    title: "The Algorithm Kids",
    description: "A seven-book fantasy adventure series for the connected generation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
