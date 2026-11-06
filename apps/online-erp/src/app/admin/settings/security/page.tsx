"use client";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";
import { useState } from "react";

export default function SecuritySettingsPage() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage("");
    const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
    const result = await response.json().catch(() => null);
    setSavingPassword(false);
    if (!response.ok) return setPasswordMessage(result?.message || result?.error || "Could not change password.");
    window.location.href = "/login";
  }
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
      <form onSubmit={changePassword} className="card mt-5 p-5 sm:p-7">
        <h2 className="text-xl font-bold">{t("changePassword")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">{t("currentPassword")}<input className="input mt-2 w-full" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
          <label className="text-sm font-semibold">{t("newPassword")}<input className="input mt-2 w-full" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
        </div>
        {passwordMessage && <p role="alert" className="mt-3 text-sm text-danger">{passwordMessage}</p>}
        <button className="btn-primary mt-5" disabled={savingPassword}>{savingPassword ? "…" : t("changePassword")}</button>
      </form>
    </AppShell>
  );
}
