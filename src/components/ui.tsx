"use client";
import { Fragment } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function PageToolbar({
  search,
  setSearch,
  children,
}: {
  search?: string;
  setSearch?: (v: string) => void;
  children?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="card p-3 flex flex-col md:flex-row gap-3 mb-5 min-w-0">
      <div className="relative flex-1 min-w-0 md:max-w-lg">
        <Search size={17} className="absolute start-3.5 top-3.5 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch?.(e.target.value)}
          placeholder={t("search") + "…"}
          className="input input-icon-start"
        />
      </div>
      <div className="flex flex-wrap gap-2 min-w-0 [&>*]:max-sm:flex-1">
        {children}
        <button className="btn-secondary whitespace-nowrap">
          <SlidersHorizontal size={16} />
          {t("filter")}
        </button>
      </div>
    </div>
  );
}
export function StatusBadge({
  active = true,
  label,
}: {
  active?: boolean;
  label?: string;
}) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}
    >
      <span
        className={`size-1.5 rounded-full ${active ? "bg-success" : "bg-muted"}`}
      />
      {label || (active ? t("active") : t("inactive"))}
    </span>
  );
}
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
}: {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}) {
  const safeTotal = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, currentPage), safeTotal);
  const start = totalItems ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from(
    { length: safeTotal },
    (_, index) => index + 1,
  ).filter(
    (value) =>
      safeTotal <= 5 ||
      value === 1 ||
      value === safeTotal ||
      Math.abs(value - page) <= 1,
  );
  const go = (next: number) => {
    if (onPageChange && next >= 1 && next <= safeTotal && next !== page)
      onPageChange(next);
  };
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mt-4 text-sm text-muted">
      <span>
        Showing {start}–{end} of {totalItems}
      </span>
      <nav aria-label="Pagination" className="flex gap-1 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="size-10 shrink-0 card grid place-items-center"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((value, index) => (
          <Fragment key={value}>
            {index > 0 && value - pages[index - 1] > 1 && (
              <span className="size-10 shrink-0 grid place-items-center">
                …
              </span>
            )}
            <button
              type="button"
              onClick={() => go(value)}
              aria-current={value === page ? "page" : undefined}
              className={`size-10 shrink-0 rounded-lg ${value === page ? "bg-primary text-white" : "card"}`}
            >
              {value}
            </button>
          </Fragment>
        ))}
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page === safeTotal}
          aria-label="Next page"
          className="size-10 shrink-0 card grid place-items-center"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
