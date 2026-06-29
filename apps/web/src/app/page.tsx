import type { Metadata } from "next";
import { HomeLayout } from "@/components/feature/home/HomeLayout";

export const metadata: Metadata = {
  title: "CV Builder — Build Polished Resumes & Cover Letters",
  description:
    "Build and export polished, ATS-friendly resumes and cover letters in minutes.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return <HomeLayout />;
}
