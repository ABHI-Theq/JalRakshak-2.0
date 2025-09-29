"use server"
import { signIn, signOut } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export const signInWithGithub=async()=>{
    await signIn("github",{redirectTo:"/"})
       revalidatePath('/')
             
}

export const signInWithGoogle=async()=>{
    await signIn("google",{redirectTo:"/"})
       revalidatePath('/')
             
}
export const fetchAlert=async()=>{}