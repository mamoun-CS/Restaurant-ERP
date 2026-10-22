import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("Starting Production Seed (Clean restaurant setup without demo data)...");

  // 1. Main Branch
  const branch = await db.branch.upsert({
    where: { code: "MAIN" },
    update: {},
    create: {
      name: "Main Branch",
      nameAr: "الفرع الرئيسي",
      code: "MAIN",
      address: "Ramallah, Palestine",
    },
  });
  console.log(`✓ Main branch verified: ${branch.name} (${branch.code})`);

  // 2. POS Cash Register
  const register = await db.cashRegister.upsert({
    where: { number: "REG-MAIN-01" },
    update: { branchId: branch.id, active: true },
    create: {
      name: "Main POS Register",
      number: "REG-MAIN-01",
      branchId: branch.id,
    },
  });
  console.log(`✓ POS Register verified: ${register.name} (${register.number})`);

  // 3. Supported Currencies
  const ils = await db.currency.upsert({
    where: { code: "ILS" },
    update: { isBase: true, active: true },
    create: { code: "ILS", name: "Israeli Shekel", nameAr: "شيكل إسرائيلي", isBase: true },
  });
  const usd = await db.currency.upsert({
    where: { code: "USD" },
    update: { active: true },
    create: { code: "USD", name: "US Dollar", nameAr: "دولار أمريكي" },
  });
  const jod = await db.currency.upsert({
    where: { code: "JOD" },
    update: { active: true },
    create: { code: "JOD", name: "Jordanian Dinar", nameAr: "دينار أردني" },
  });

  // 4. Currency Denominations for Cash Drawer Reconciliation
  const denominations = [
    [ils.id, "ILS", [200, 100, 50, 20, 10, 5, 2, 1]],
    [usd.id, "USD", [100, 50, 20, 10, 5, 1]],
    [jod.id, "JOD", [50, 20, 10, 5, 1]],
  ] as const;

  for (const [currencyId, code, values] of denominations) {
    for (const [index, value] of values.entries()) {
      await db.currencyDenomination.upsert({
        where: { currencyId_value: { currencyId, value } },
        update: { active: true, sortOrder: index, label: `${value} ${code}` },
        create: { currencyId, value, label: `${value} ${code}`, sortOrder: index },
      });
    }
  }

  // 5. Default Exchange Rates (Base: ILS)
  await db.exchangeRate.create({ data: { currencyId: ils.id, rateToBase: 1, active: true } }).catch(() => null);
  await db.exchangeRate.create({ data: { currencyId: usd.id, rateToBase: 3.65, active: true } }).catch(() => null);
  await db.exchangeRate.create({ data: { currencyId: jod.id, rateToBase: 5.15, active: true } }).catch(() => null);

  console.log("\n=================================================================");
  console.log("✓ Production seed completed successfully!");
  console.log("  No demo users or menu items were created.");
  console.log("  Next step: Create the real administrator account using:");
  console.log("  npm run create-admin <email> <name> <password>");
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("Production seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
