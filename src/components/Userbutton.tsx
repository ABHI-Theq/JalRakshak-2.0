"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import type { Session } from "next-auth";
import { HelpCircle, LogOut, Settings2, User } from "lucide-react";
import {  useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

const UserButton = ({
  session,
  showDetails = false,
}: {
  session: Session;
  showDetails?: boolean;
}) => {

  const {t,i18n}=useTranslation()

  const router=useRouter()
  return (
    <DropdownMenu>
      {/* Avatar / Trigger */}
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none">
          <Image
            src={session?.user?.image ?? "/user.png"}
            alt="User"
            width={40}
            height={40}
            className="rounded-full ring-2 ring-[#123458]/40 hover:ring-[#123458]/60 transition"
          />
          {showDetails && (
            <div className="hidden text-left sm:block">
              <p className="font-semibold text-[#123458] dark:text-blue-100">
                {session?.user?.name}
              </p>
              <p className="text-sm text-[#123458]/70 dark:text-blue-300/70">
                {session?.user?.email}
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown Menu */}
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border border-blue-200/60 bg-white/90 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-gray-900/90"
      >
        <DropdownMenuLabel className="text-sm font-semibold text-[#123458] dark:text-blue-100">
          {t("myaccount")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2 text-[#123458] transition hover:bg-[#123458]/70 dark:text-blue-200 dark:hover:bg-blue-800/30">
            <User className="h-4 w-4" /> {t("profile")}
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-[#123458] transition hover:bg-[#123458]/70 dark:text-blue-200 dark:hover:bg-blue-800/30">
            <Settings2 className="h-4 w-4" /> {t("settings")}
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-[#123458] transition hover:bg-[#123458]/70 dark:text-blue-200 dark:hover:bg-blue-800/30">
            <HelpCircle className="h-4 w-4" /> Help
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            await signOut({redirectTo:"/"});
          }}
          className="flex items-center gap-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" /> {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
