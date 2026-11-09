import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akıllı Mama Kabı",
  description: "Köpekler için akıllı mama takip sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* AuthProvider ile tüm sayfaları sardık */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
