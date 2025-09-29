"use client";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fff6ee] dark:bg-transparent">
      {/* Decorative Blur Orbs */}
      {/* <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-600/20" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-600/20" /> */}

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <h1 className="mb-6 text-center text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
          Welcome Back
        </h1>
        <p className="mb-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Sign in to continue to{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            JalRakshak
          </span>
        </p>

        <div className="flex flex-col gap-4">
          {/* Google Login */}
          <button
            onClick={async () => await signIn("google",{redirectTo:"/"})}
            className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-md transition hover:scale-[1.02] hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FaGoogle className="h-5 w-5 text-red-500" />
            Continue with Google
          </button>

          {/* GitHub Login */}
          <button
            onClick={async () => await signIn("github",{redirectTo:"/"})}
            className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-md transition hover:scale-[1.02] hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FaGithub className="h-5 w-5 text-gray-900 dark:text-white" />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
