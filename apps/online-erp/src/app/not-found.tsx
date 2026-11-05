import Link from "next/link";
import { ArrowLeft, Home, Printer } from "lucide-react";

export default function NotFound() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="size-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-6 text-2xl font-bold">
        404
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">الصفحة غير موجودة</h1>
      <p className="text-muted max-w-md mb-8">
        لم يتم العثور على الصفحة المطلوبة. ربما تم نقلها أو تمت كتابة الرابط بشكل غير صحيح.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/admin" className="btn-primary flex items-center gap-2">
          <Home size={18} />
          لوحة التحكم الرئيسية
        </Link>
        <Link href="/admin/settings/printing" className="btn-secondary flex items-center gap-2">
          <Printer size={18} />
          إعدادات الطباعة
        </Link>
      </div>
    </div>
  );
}
