"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  itemName?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title = "حذف العنصر",
  description = "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  itemName,
  confirmText = "حذف",
  cancelText = "إلغاء",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const el = dialogRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => confirmRef.current?.focus());

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="d-modal relative w-full max-w-md rounded-[20px] bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 end-4 size-8 grid place-items-center rounded-lg text-muted hover:text-text transition"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-50">
            <div className="flex size-11 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" strokeWidth={2} />
            </div>
          </div>

          <h3
            id="confirm-dialog-title"
            className="mt-5 text-lg font-bold text-text"
          >
            {title}
          </h3>
          <p
            id="confirm-dialog-desc"
            className="mt-2 text-sm text-muted leading-relaxed"
          >
            {description}
          </p>
          {itemName && (
            <span className="mt-3 inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
              {itemName}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary w-full sm:w-auto"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {loading ? "جارٍ الحذف…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
