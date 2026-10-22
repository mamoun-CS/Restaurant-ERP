import type { Metadata, Viewport } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const arabic = Noto_Kufi_Arabic({ variable: "--font-arabic", subsets: ["arabic"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "شيخ الكار | Restaurant ERP",
  description: "Premium bilingual restaurant operations and point of sale for Sheikh Al Kar.",
  applicationName: "شيخ الكار",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "شيخ الكار POS",
  },
  icons: {
    icon: "/brand/sheikh-al-kar-icon.svg",
    apple: "/brand/sheikh-al-kar-icon.svg",
  },
  openGraph: {
    title: "شيخ الكار | Restaurant ERP",
    description: "Premium bilingual restaurant operations and point of sale for Sheikh Al Kar.",
    images: ["/brand/sheikh-al-kar-horizontal.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F86800",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${arabic.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked' || name === 'bis_register' || (name && name.indexOf('__processed_') === 0)) {
                      return;
                    }
                    return origSetAttr.apply(this, arguments);
                  };
                } catch(e) {}

                try {
                  var origError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var arg = arguments[i];
                      if (typeof arg === 'string' && (arg.indexOf('bis_skin_checked') !== -1 || arg.indexOf('bis_register') !== -1 || (arg.indexOf('hydration') !== -1 && arg.indexOf('bis_') !== -1))) {
                        return;
                      }
                    }
                    return origError.apply(console, arguments);
                  };
                } catch(e) {}

                try {
                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes') {
                          var name = m.attributeName;
                          if (name === 'bis_skin_checked' || name === 'bis_register' || (name && name.indexOf('__processed_') === 0)) {
                            m.target.removeAttribute(name);
                          }
                        }
                      }
                    });
                    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked', 'bis_register'] });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
