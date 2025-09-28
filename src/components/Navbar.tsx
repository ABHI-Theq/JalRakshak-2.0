"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";
  const handleLogin = () => router.push("/login");
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-[#0b1220]/60 shadow-emerald-200">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex space-x-10">
          <div className="relative">
            <span className="absolute inset-0    opacity-70" />
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-blue-700 dark:text-blue-300"
            >
              <img src="/logo.svg" alt="JalRakshak" className="h-7 w-7" />
              {t("appName")}
            </Link>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavItem href="/" pathname={pathname}>{t("navHome")}</NavItem>
          <NavItem href="/analysis" pathname={pathname}>{t("navAnalysis")}</NavItem>
          <NavItem href="/weather" pathname={pathname}>{t("navWeather")}</NavItem>
          <NavItem href="/structure" pathname={pathname}>{t("navStructure")}</NavItem>
          <NavItem href="/faqs" pathname={pathname}>{t("navFaqs")}</NavItem>
          <NavItem href="/about" pathname={pathname}>{t("navAbout")}</NavItem>

          <div className="mx-2 h-6 w-px bg-blue-200 dark:bg-white/10" />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
            disabled={!mounted}
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
          >
            {i18n.language === "en" ? t("toggleToHindi") : t("toggleToEnglish")}
          </Button>

          {/* Login Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogin}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Button>
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
        "rounded-md px-3 py-2 text-sm font-medium text-blue-800/80 transition hover:text-blue-900 hover:bg-blue-100/50 dark:text-blue-200/80 dark:hover:text-blue-100 dark:hover:bg-white/5",
        isActive &&
          "text-blue-900 bg-blue-100/70 shadow-sm dark:text-blue-100 dark:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
};
