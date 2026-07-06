"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en, type TranslationKey } from "@/i18n/en";
import { ar } from "@/i18n/ar";

type Locale = "en" | "ar";
type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey) => string };
const LanguageContext = createContext<LanguageContextValue>({ locale: "en", setLocale: () => {}, t: (k) => en[k] });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => { const saved = localStorage.getItem("locale") as Locale | null; if (saved) setLocaleState(saved); }, []);
  const setLocale = (next: Locale) => { setLocaleState(next); localStorage.setItem("locale", next); };
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (key: TranslationKey) => (locale === "ar" ? ar[key] : en[key]) }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
