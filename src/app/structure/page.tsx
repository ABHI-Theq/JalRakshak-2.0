"use client"
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Structure from "@/components/StructureContent";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Structure/>
    </Suspense>
  );
}