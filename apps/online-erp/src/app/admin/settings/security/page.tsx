"use client";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";

export default function SecuritySettingsPage() {
  const { t } = useLanguage();
  return (
    <AppShell title={t("security")} description={t("securityDescription")}>
      <div className="card p-5 sm:p-7">
        <h2 className="text-xl font-bold">{t("security")}</h2>
        <p className="text-sm text-muted mt-1">{t("securityHelp")}</p>
        <div className="grid gap-5 mt-7">
          <label className="block">
            <span className="text-sm font-semibold block mb-2">{t("sessionTimeout")}</span>
            <select className="input max-w-xs">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold block mb-2">{t("passwordPolicy")}</span>
            <select className="input max-w-xs">
              <option>Standard (8+ characters)</option>
              <option>Strong (12+ characters, mixed case, numbers, symbols)</option>
            </select>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
            <span className="text-sm font-semibold">{t("twoFactorAuth")}</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
            <span className="text-sm font-semibold">{t("loginNotifications")}</span>
          </label>
        </div>
        <div className="mt-7 pt-5 border-t border-border flex justify-end">
          <button className="btn-primary">{t("save")}</button>
        </div>
      </div>
    </AppShell>
  );
}
