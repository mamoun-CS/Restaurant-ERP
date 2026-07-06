import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createToken } from "@/lib/auth";

const schema = z.object({ email: z.email(), password: z.string().min(6) });
const demoUsers = [
  { userId: "admin-demo", name: "Maya Haddad", email: "admin@noura.test", passwordHash: "$2b$10$h2CfvbyiFFCBvnc.R9FKYO60Q.LpFB1RFijPG4FFFCqXAMOBs8BLO", role: "ADMIN" as const, branchId: "main-branch" },
  { userId: "cashier-demo", name: "Omar Khalil", email: "cashier@noura.test", passwordHash: "$2b$10$h2CfvbyiFFCBvnc.R9FKYO60Q.LpFB1RFijPG4FFFCqXAMOBs8BLO", role: "CASHIER" as const, branchId: "main-branch" },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const user = demoUsers.find((item) => item.email === parsed.data.email.toLowerCase());
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const session = { userId:user.userId, name:user.name, email:user.email, role:user.role, branchId:user.branchId };
  const token = await createToken(session);
  const response = NextResponse.json({ role: user.role });
  response.cookies.set("erp_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 8, path: "/" });
  return response;
}
