"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, Palette, Printer, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/i18n/en";

const settingsNav: { href: string; labelKey: TranslationKey; icon: typeof Building2 }[] = [
  { href: "/admin/settings", labelKey: "businessProfile", icon: Building2 },
  { href: "/admin/settings/printing", labelKey: "printing", icon: Printer },
  { href: "/admin/settings/branding", labelKey: "branding", icon: Palette },
  { href: "/admin/settings/notifications", labelKey: "notifications", icon: Bell },
  { href: "/admin/settings/security", labelKey: "security", icon: ShieldCheck },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <AppShell title={t("settings")} description={t("businessProfileDescription")}>
      <div className="grid lg:grid-cols-[240px_1fr] gap-5">
        <aside className="card p-2 h-fit">
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin/settings" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm transition ${active ? "bg-primary-soft text-primary font-bold" : "text-muted hover:bg-background"}`}
                >
                  <Icon size={18} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="card p-5 sm:p-7">
          <h2 className="text-xl font-bold">{t("businessProfile")}</h2>
          <p className="text-sm text-muted mt-1">{t("businessProfileDescription")}</p>
          <div className="grid sm:grid-cols-2 gap-5 mt-7">
            <Field label="Business name (English)" value="Sheikh Al Kar" />
            <Field label="اسم النشاط (العربية)" value="شيخ الكار" rtl />
            <Field label="Tax number" value="310048229" />
            <Field label="Phone number" value="+970 59 123 4567" />
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold block mb-2">Address</span>
              <input className="input" defaultValue="Ramallah, Palestine" />
            </label>
            <Field label="Currency" value="₪ — Israeli New Shekel" />
            <Field label="Timezone" value="Asia/Hebron (GMT+3)" />
          </div>
          <div className="mt-7 pt-5 border-t border-border flex justify-end">
            <button className="btn-primary">{t("save")}</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, value, rtl }: { label: string; value: string; rtl?: boolean }) {
  return (
    <label>
      <span className="text-sm font-semibold block mb-2">{label}</span>
      <input className="input" defaultValue={value} dir={rtl ? "rtl" : undefined} />
    </label>
  );
}
