
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerDataProvider } from "@/hooks/use-player-data";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PushNotificationPrompt } from "@/components/custom/PushNotificationPrompt";
import { PlayerDataSync } from "@/hooks/use-player-data-sync";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SystemLife",
  description: "A sua vida, gamificada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <AuthProvider>
              <PlayerDataProvider>
                <PlayerDataSync />
                {children}
                <Toaster />
                <Sonner richColors closeButton position="top-right" />
                <PushNotificationPrompt />
              </PlayerDataProvider>
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
