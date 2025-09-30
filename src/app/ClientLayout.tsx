"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import I18nProvider from "@/I18nProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import ChatBot from "@/components/Chatbot";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/auth/sign-in";
  

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <I18nProvider>
          {showNavbar && <Navbar />}
          {children}
             <ChatBot />
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
