import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calendar Chaos - Meeting Scheduling Game",
  description: "A browser-based strategy game where you schedule meetings for busy executives. Think SimCity meets Tetris meets corporate hell!",
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
