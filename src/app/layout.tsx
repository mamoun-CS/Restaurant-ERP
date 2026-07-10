import type { Metadata, Viewport } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const arabic = Noto_Kufi_Arabic({ variable: "--font-arabic", subsets: ["arabic"] });

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "شيخ الكار | Restaurant ERP",
  description: "Premium bilingual restaurant operations and point of sale for Sheikh Al Kar.",
  applicationName: "شيخ الكار",
  icons: {
    icon: "/brand/sheikh-al-kar-icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "شيخ الكار | Restaurant ERP",
    description: "Premium bilingual restaurant operations and point of sale for Sheikh Al Kar.",
    images: ["/brand/sheikh-al-kar-horizontal.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F86800",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${inter.variable} ${arabic.variable}`}><body><LanguageProvider>{children}</LanguageProvider></body></html>;
}
