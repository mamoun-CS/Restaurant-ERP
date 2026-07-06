import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const arabic = Noto_Kufi_Arabic({ variable: "--font-arabic", subsets: ["arabic"] });

export const metadata: Metadata = { title: "Noura POS — Restaurant ERP", description: "Bilingual restaurant operations and point of sale" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${inter.variable} ${arabic.variable}`}><body><LanguageProvider>{children}</LanguageProvider></body></html>;
}

