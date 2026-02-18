import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "منيو المطعم | Restaurant Menu",
  description: "منيو إلكتروني عصري للمطاعم مع لوحة تحكم",
  keywords: ["منيو", "مطعم", "قائمة طعام", "restaurant", "menu"],
  authors: [{ name: "Restaurant Menu Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
