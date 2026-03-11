import type { Metadata } from "next";
import { GlobalEffects } from "@/components/GlobalEffects";
import "./globals.css";

export const metadata: Metadata = {
  title: "unpocoloco",
  description: "Are you sure you want to be here?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased crt`}>
        <GlobalEffects />
        {children}
      </body>
    </html>
  );
}
