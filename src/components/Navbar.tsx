"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import UserButton from "./Userbutton";

export const Navbar = () => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";
  const handleLogin = () => router.push("/auth/sign-in");
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/30 shadow-sm">
      <nav className="mx-auto flex h-15 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-serif font-bold text-gray-800 hover:text-gray-900 transition-colors"
          >
            <img src="/logo.svg" alt="JalRakshak" className="h-8 w-8" />
            {t("appName")}
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex items-center space-x-8">
          <NavItem href="/" pathname={pathname}>{t("navHome")}</NavItem>
          {session?.user && (
            <NavItem href="/dashboard" pathname={pathname}>{t("dashboard")}</NavItem>
          )}
          <NavItem href="/weather" pathname={pathname}>{t("navWeather")}</NavItem>
          <NavItem href="/faqs" pathname={pathname}>{t("navFaqs")}</NavItem>
          
          <div className="h-6 w-px bg-gray-300" />
          
          {/* Government Policies Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            {t("governmentPolicies")}
          </Button>
          
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
          >
            {i18n.language === "en" ? "हिंदी" : "English"}
          </Button>

          {/* Login/User */}
          {session?.user ? (
            <UserButton session={session}/>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogin}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

const NavItem = ({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) => {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200",
        isActive && "text-gray-900 font-semibold"
      )}
    >
      {children}
    </Link>
  );
};
