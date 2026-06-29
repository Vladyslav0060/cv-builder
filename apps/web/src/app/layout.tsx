import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { TopNav } from "@/components/layout/top-nav";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { Toaster } from "@/components/ui/sonner";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://cv-builder-chi-black.vercel.app";
const SITE_NAME = "CV Builder";
const SITE_DESCRIPTION =
  "Build and export polished, ATS-friendly resumes and cover letters in minutes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Toaster />
        <Providers>
          <main className="flex h-dvh flex-col overflow-hidden">
            <TopNav />
            <AppBreadcrumbs />
            <div className="flex min-h-0 flex-1 flex-col overflow-auto">
              <div className="min-h-0 flex-1">{children}</div>
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
