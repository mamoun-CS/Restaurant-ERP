"use client";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";

export default function NotificationsSettingsPage() {
  const { t } = useLanguage();
  return (
    <AppShell title={t("notifications")} description={t("notificationsDescription")}>
      <div className="card p-5 sm:p-7">
        <h2 className="text-xl font-bold">{t("notifications")}</h2>
        <p className="text-sm text-muted mt-1">{t("notificationsHelp")}</p>
        <div className="grid gap-4 mt-7">
          {[
            { label: t("lowStockAlerts"), desc: t("lowStockAlertsDesc"), checked: true },
            { label: t("dailySalesReport"), desc: t("dailySalesReportDesc"), checked: false },
            { label: t("shiftCloseReminder"), desc: t("shiftCloseReminderDesc"), checked: true },
            { label: t("newOrderAlert"), desc: t("newOrderAlertDesc"), checked: true },
          ].map((item) => (
            <label key={item.label} className="flex items-start gap-3 rounded-xl border border-border p-4">
              <input type="checkbox" defaultChecked={item.checked} className="mt-1 size-4 accent-[var(--primary)]" />
              <div>
                <span className="text-sm font-bold block">{item.label}</span>
                <span className="text-xs text-muted block mt-0.5">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-7 pt-5 border-t border-border flex justify-end">
          <button className="btn-primary">{t("save")}</button>
        </div>
      </div>
    </AppShell>
  );
}
