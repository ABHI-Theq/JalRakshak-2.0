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

// utils/fetchAnnualRainfall.ts

export type AnnualRainfallData = {
  location?: string;
  annualRainfall?: number;
  monthlyData?: { month: string; rainfall: number }[];
  loading?: boolean;
  error?: string;
};

export async function fetchAnnualRainfall(
  lat: number,
  lon: number,
  locationName: string
): Promise<AnnualRainfallData> {
  try {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
    const endDate = new Date(currentDate.getFullYear() - 1, 11, 31);

    const rainfallUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate
      .toISOString()
      .split("T")[0]}&end_date=${endDate
      .toISOString()
      .split("T")[0]}&daily=precipitation_sum&timezone=auto`;

    const rainfallRes = await fetch(rainfallUrl);
    const rainfallJson = await rainfallRes.json();

    const dailyPrecipitation: number[] = rainfallJson?.daily?.precipitation_sum || [];
    const dailyDates: string[] = rainfallJson?.daily?.time || [];

    // --- 1. Compute total rainfall ---
    const annualTotal = dailyPrecipitation.reduce(
      (sum, val) => sum + (val || 0),
      0
    );

    // --- 2. Prepare monthly buckets ---
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    const monthlyData = months.map((m) => ({ month: m, rainfall: 0 }));

    // --- 3. Add daily values into months ---
    dailyPrecipitation.forEach((val, idx) => {
      const date = new Date(dailyDates[idx]);
      const monthIndex = date.getMonth(); // 0 = Jan, 11 = Dec
      monthlyData[monthIndex].rainfall += val || 0;
    });

    // --- 4. Round values ---
    monthlyData.forEach((m) => {
      m.rainfall = Math.round(m.rainfall);
    });

    return {
      location: locationName,
      annualRainfall: Math.round(annualTotal),
      monthlyData,
      loading: false,
    };
  } catch (err: any) {
    return {
      error: err?.message || "Failed to fetch rainfall data",
      loading: false,
    };
  }
}


