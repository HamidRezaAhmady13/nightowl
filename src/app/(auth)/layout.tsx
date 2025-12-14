import "react-tuby/css/main.css";
import "@/styles/index.css";

import React from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import ReactQueryProvider from "@/features/components/ReactQueryProvider";
// import { io } from "socket.io-client";

import Header from "@/features/components/header/Header";
import { AppShell } from "@/features/components/layout/AppShell";
import { PageRow } from "@/features/components/layout/PageRow";
import { PageMain } from "@/features/components/layout/PageMain";
import SafeFullscreenShim from "@/features/components/SafeFullscreenShim";
// import SocketProvider from "@/features/components/SocketProvider";
import { AuthProvider } from "@/features/components/AuthContext";
import ReactQueryProvider from "@/features/components/ReactQueryProvider";

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

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="protected-wrapper">
      {/* You can add navbars, sidebars, or context providers here */}
      {children}
    </div>
  );
}
