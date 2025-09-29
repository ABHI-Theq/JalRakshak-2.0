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
import Image from "next/image";

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
    <header className="sticky top-0 z-50 w-full border-b  border-blue-100/60  backdrop-blur  supports-[backdrop-filter]:bg-[#ffecca] dark:border-white/10 dark:bg-[#0b1220]/60 ">
      <nav className="  flex h-18 w-full items-center justify-between sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex space-x-10"> 
          <div className="relative">
            <span className="absolute inset-0    opacity-70" />
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#123458]  dark:text-blue-300"
            >
              <Image src={"/logo.svg"} alt="JalRakshak" className="h-7 w-7" />
              {t("appName")}
            </Link>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavItem href="/" pathname={pathname}>{t("navHome")}</NavItem>
          {
            session?.user && (
              <>
                <NavItem href="/analysis" pathname={pathname}>{t("navAnalysis")}</NavItem>
                <NavItem href="/weather" pathname={pathname}>{t("navWeather")}</NavItem>
                <NavItem href="/structure" pathname={pathname}>{t("navStructure")}</NavItem>
              </>
            )
          }
          <NavItem href="/faqs" pathname={pathname}>{t("navFaqs")}</NavItem>
          <NavItem href="/about" pathname={pathname}>{t("navAbout")}</NavItem>

          <div className="mx-2 h-6 w-px bg-[#123458]/80 dark:bg-white/10" />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-[#123458]/80 hover:text-[#123458] hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
          >
            {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-[#123458]/80 hover:text-[#123458] hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
          >
            {i18n.language === "en" ? t("toggleToHindi") : t("toggleToEnglish")}
          </Button>

          {
            session?.user?(
              <UserButton session={session}/>
            ):(
                        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogin}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Button>
            )
          }          
        </div>
      </nav>
      <hr className="border-t-.5 border-[#123458] shadow-md backdrop-blur"/>
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
        " font-bold rounded-md px-3 py-2 text-md  text-[#123458] transition  hover:text-[#0F2D46] hover:bg-[#fff6ee] dark:text-blue-200/80 dark:hover:text-blue-100 dark:hover:bg-white/5",
        isActive &&
        " text-[#0C2235] bg-[#FFDFA3]  dark:text-blue-100 dark:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
};