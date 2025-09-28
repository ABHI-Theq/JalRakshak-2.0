import Image from "next/image";
import Link from "next/link";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800 dark:from-gray-900 dark:to-gray-800">
      <Link href="/" className="absolute top-10 left-10 cursor-pointer">
        <Image src="/go-back.png" alt="Go Home" width={45} height={40} />
      </Link>

      <main className="z-10 w-full max-w-md px-4">{children}</main>
    </div>
  );
};

export default Layout;
