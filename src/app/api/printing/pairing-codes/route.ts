import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { assertSameOrigin, rateLimit, requestIp } from "@/lib/api";
import { audit } from "@/lib/cash";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import { createPairingCode, hashPrintSecret } from "@/lib/printing/device-auth";
import { pairingCodeSchema } from "@/lib/printing/validation";

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`print-pairing:${requestIp(request)}`, 10, 60_000);
  if (limited) return limited;
  const user = await requireAdmin();
  if (user instanceof NextResponse) return user;
  const parsed = pairingCodeSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_INPUT",
        message: "Invalid branch.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  const branch = await db.branch.findUnique({
    where: { id: parsed.data.branchId },
  });
  if (!branch)
    return NextResponse.json(
      {
        success: false,
        code: "RESOURCE_NOT_FOUND",
        message: "Branch not found.",
      },
      { status: 404 },
    );
  const code = createPairingCode();
  const expiresAt = addMinutes(
    new Date(),
    Number(process.env.PRINT_PAIRING_CODE_EXPIRATION_MINUTES || 10),
  );
  const row = await db.printPairingCode.create({
    data: {
      branchId: branch.id,
      codeHash: hashPrintSecret(code),
      expiresAt,
      createdById: user.userId,
    },
  });
  await audit(
    user,
    "PRINT_PAIRING_CODE_CREATED",
    "PrintPairingCode",
    row.id,
    { branchId: branch.id, expiresAt },
    null,
    null,
    request,
  );
  return NextResponse.json({ success: true, code, expiresAt });
}
