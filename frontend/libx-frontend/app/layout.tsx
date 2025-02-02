import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideNav from "@/app/ui/home/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LibX",
  description: "A library management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <script type="text/javascript" src="https://books.google.com/books/previewlib.js"></script>
      </head>
      <body className={inter.className}>{children}
      </body>
    </html>
  );
}
