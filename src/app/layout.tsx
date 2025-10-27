import "react-tuby/css/main.css";
import "@/styles/index.css";

import React, { useEffect } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactQueryProvider from "@/features/components/ReactQueryProvider";

import Header from "@/features/components/header/Header";
import { AppShell } from "@/features/components/layout/AppShell";
import { PageRow } from "@/features/components/layout/PageRow";
import { PageMain } from "@/features/components/layout/PageMain";
import ClientErrorCapture from "@/features/components/ClientErrorCapture";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Social App",
  description: "Chat, post, and call in real time",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <head></head>
      <body className="o-app-root min-h-screen  ">
        <ClientErrorCapture />
        <ReactQueryProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-text)",
                transition: "all 0.3s ease-in-out",
              },
              success: {
                iconTheme: {
                  primary: "var(--toast-text)",
                  secondary: "var(--toast-bg)",
                },
              },
            }}
          />
          <AppShell>
            <div className="relative u-bg-main  h-24">
              <Header />
            </div>
            {/* </div> */}
            <div className="relative">
              <PageRow>
                <PageMain>{children}</PageMain>
              </PageRow>
            </div>
          </AppShell>

          <ReactQueryDevtools initialIsOpen={false} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
