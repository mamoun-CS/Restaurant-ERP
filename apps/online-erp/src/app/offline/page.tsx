"use client";

import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function OfflineFallbackPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="card max-w-md w-full p-8 shadow-xl flex flex-col items-center">
        <BrandLogo className="max-w-[180px] mb-6" />
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-500 grid place-items-center mb-4">
          <WifiOff size={32} />
        </div>
        <h1 className="text-2xl font-bold">وضع عدم الاتصال بالإنترنت</h1>
        <p className="text-sm text-muted mt-2">
          لا يوجد اتصال بالإنترنت حالياً. يمكنك المتابعة في نقطة البيع وتسجيل وطباعة الطلبات دون انقطاع.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/pos" className="btn-primary flex-1 flex items-center justify-center gap-2">
            العودة إلى نقطة البيع (POS)
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    </main>
  );
}
