import type { Metadata } from "next";
import { GlobalEffects } from "@/components/GlobalEffects";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "unpocoloco",
  description: "Are you sure you want to be here?",
  icons: {
    icon: "/logo.png",
  },
};

import { BalanceProvider } from "@/context/BalanceContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <BalanceProvider>
          <GlobalEffects />
          {children}
          <Analytics />
        </BalanceProvider>
      </body>
    </html>
  );
}
