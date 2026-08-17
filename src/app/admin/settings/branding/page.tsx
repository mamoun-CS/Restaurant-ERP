"use client";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";

export default function BrandingSettingsPage() {
  const { t } = useLanguage();
  return (
    <AppShell title={t("branding")} description={t("brandingDescription")}>
      <div className="card p-5 sm:p-7">
        <h2 className="text-xl font-bold">{t("branding")}</h2>
        <p className="text-sm text-muted mt-1">{t("brandingHelp")}</p>
        <div className="grid sm:grid-cols-2 gap-5 mt-7">
          <div>
            <span className="text-sm font-semibold block mb-2">Logo (English)</span>
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted text-sm">
              Logo upload placeholder
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold block mb-2">Logo (Arabic)</span>
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted text-sm">
              Logo upload placeholder
            </div>
          </div>
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold block mb-2">Primary color</span>
            <input type="color" className="input h-11 w-full max-w-xs" defaultValue="#f86800" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold block mb-2">Receipt footer text (English)</span>
            <input className="input" defaultValue="Thank you — see you again!" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold block mb-2">Receipt footer text (Arabic)</span>
            <input className="input" defaultValue="شكراً لزيارتكم!" dir="rtl" />
          </label>
        </div>
        <div className="mt-7 pt-5 border-t border-border flex justify-end">
          <button className="btn-primary">{t("save")}</button>
        </div>
      </div>
    </AppShell>
  );
}
