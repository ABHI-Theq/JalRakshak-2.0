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
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const UserButton = ({
  session,
  showDetails = false,
}: {
  session: Session;
  showDetails?: boolean;
}) => {

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
            className="rounded-full ring-2 ring-blue-400/40 hover:ring-blue-500/60 transition"
          />
          {showDetails && (
            <div className="hidden text-left sm:block">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {session?.user?.name}
              </p>
              <p className="text-sm text-blue-700/70 dark:text-blue-300/70">
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
        <DropdownMenuLabel className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2 text-blue-800 transition hover:bg-blue-100/70 dark:text-blue-200 dark:hover:bg-blue-800/30">
            <User className="h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-blue-800 transition hover:bg-blue-100/70 dark:text-blue-200 dark:hover:bg-blue-800/30">
            <Settings2 className="h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-blue-800 transition hover:bg-blue-100/70 dark:text-blue-200 dark:hover:bg-blue-800/30">
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
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
