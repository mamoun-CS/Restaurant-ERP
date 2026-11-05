import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const name = (args[1] || process.env.ADMIN_NAME || "System Admin").trim();
  const password = args[2] || process.env.ADMIN_PASSWORD || "";

  if (!email || !email.includes("@")) {
    console.error("Usage: npm run create-admin <email> <name> <password>");
    console.error("Example: npm run create-admin admin@sheikhelerp.com \"General Manager\" \"P@ssword2026!\"");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("Error: Admin password must be at least 8 characters long.");
    process.exit(1);
  }

  let branch = await db.branch.findFirst({ where: { code: "MAIN" } });
  if (!branch) {
    branch = await db.branch.create({
      data: {
        code: "MAIN",
        name: "Main Branch",
        nameAr: "الفرع الرئيسي",
        address: "Ramallah, Palestine",
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: Role.ADMIN,
      active: true,
      branchId: branch.id,
      forcePasswordChange: true,
      failedLoginCount: 0,
      lockedUntil: null,
    },
    create: {
      name,
      email,
      passwordHash,
      role: Role.ADMIN,
      active: true,
      branchId: branch.id,
      forcePasswordChange: true,
    },
  });

  console.log("\n========================================================");
  console.log("✓ Admin user created / updated successfully!");
  console.log(`  User ID:               ${user.id}`);
  console.log(`  Email:                 ${user.email}`);
  console.log(`  Name:                  ${user.name}`);
  console.log(`  Role:                  ${user.role}`);
  console.log(`  Branch:                ${branch.name} (${branch.code})`);
  console.log(`  Force Password Change: ${user.forcePasswordChange ? "Yes (Must change on first login)" : "No"}`);
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("Failed to create admin user:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
