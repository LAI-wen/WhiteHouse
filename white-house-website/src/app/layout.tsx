import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "../components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "白房子 - DC 企劃",
  description: "《白房子》Discord 企劃 - 陣營懸疑探索劇情遊戲",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ margin: 0, background: '#f5f5f5' }}>
        <Navigation />
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
