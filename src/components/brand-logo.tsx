import clsx from "clsx";

type BrandLogoProps = {
  variant?: "icon" | "horizontal" | "full" | "mono";
  className?: string;
  showText?: boolean;
  size?: "sm" | "lg";
  tone?: "dark" | "light";
};

function SheikhIcon({ mono = false }: { mono?: boolean }) {
  const primary = mono ? "#111111" : "var(--primary)";
  const cream = mono ? "#ffffff" : "#ffffff";
  const gold = mono ? "#ffffff" : "var(--accent)";
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className="size-full">
      <rect x="54" y="46" width="404" height="420" rx="86" fill={primary} />
      <path d="M135 128h242c22 0 40 18 40 40v128c0 31-25 56-56 56h-4c-27 0-49-22-49-49v-87H204v87c0 27-22 49-49 49h-4c-31 0-56-25-56-56V168c0-22 18-40 40-40Z" fill={cream} />
      <path d="M209 174h118l-21 86c-5 21 2 43 18 58l13 12H210c28-30 41-65 39-105l-40-51Z" fill={primary} />
      <path d="M203 168h138l-12 46H216l-13-46Z" fill={gold} />
      <path d="M218 187h34l-18 11-16-11Zm53 0h34l-18 11-16-11Zm53 0h21l-11 11-10-11Z" fill={cream} />
      <path d="M222 223h52c3 25 0 53-9 83" stroke={cream} strokeWidth="12" strokeLinecap="round" />
      <path d="M294 224c6 33 6 67 0 101M320 224c5 34 5 68 0 101M345 224c4 32 4 65 0 98" stroke={cream} strokeWidth="10" strokeLinecap="round" />
      <path d="M219 224c0 35-8 61-29 84-10 11-6 27 9 31l37 10" stroke={cream} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M220 295c21 0 30 23 13 35-12 9-32 5-36-10" stroke={gold} strokeWidth="12" strokeLinecap="round" />
      <path d="M209 357c-8 24-20 43-39 57h153c-15-13-24-31-26-57H209Z" fill={cream} />
      <path d="M202 374c-7 16-16 29-28 39M220 374c-6 16-14 29-25 39M238 374c-5 16-12 29-21 39M256 374c-4 16-9 29-16 39" stroke={primary} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function BrandLogo({ variant = "horizontal", className, showText = true, size = "sm", tone = "dark" }: BrandLogoProps) {
  const mono = variant === "mono";
  const textColor = mono ? "text-black" : tone === "light" ? "text-primary" : "text-white";
  const subTextColor = mono ? "text-black" : tone === "light" ? "text-muted" : "text-sidebar-muted";
  if (variant === "icon" || !showText) {
    return <span className={clsx("inline-grid size-10 shrink-0 place-items-center", className)} aria-label="شيخ الكار"><SheikhIcon mono={mono} /></span>;
  }

  if (variant === "full") {
    return (
      <span className={clsx("inline-flex flex-col items-center text-center", className)} aria-label="شيخ الكار Restaurant">
        <span className="size-24"><SheikhIcon mono={mono} /></span>
        <span dir="rtl" className={clsx("mt-3 font-extrabold leading-none", mono ? "text-black" : "text-white")}>شيخ الكار</span>
        <span className={clsx("mt-2 text-[10px] font-bold uppercase tracking-[.28em]", mono ? "text-black" : "text-brand-gold")}>Restaurant</span>
      </span>
    );
  }

  return (
    <span className={clsx("inline-flex min-w-0 items-center gap-3", className)} aria-label="شيخ الكار Restaurant">
      <span className={clsx("shrink-0", size === "lg" ? "size-14" : "size-10")}><SheikhIcon mono={mono} /></span>
      <span className="min-w-0">
        <span dir="rtl" className={clsx("block truncate font-extrabold leading-tight", size === "lg" ? "text-xl" : "text-base", textColor)}>شيخ الكار</span>
        <span className={clsx("block truncate font-bold uppercase tracking-[.2em]", size === "lg" ? "text-xs" : "text-[10px]", subTextColor)}>Restaurant</span>
      </span>
    </span>
  );
}
