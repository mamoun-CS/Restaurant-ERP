import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
async function main() {
  const branch = await db.branch.upsert({ where:{code:"MAIN"}, update:{}, create:{name:"Main Branch",nameAr:"الفرع الرئيسي",code:"MAIN",address:"Ramallah, Palestine"} });
  const passwordHash = await bcrypt.hash("Demo123!", 12);
  await db.user.upsert({where:{email:"admin@noura.test"},update:{},create:{name:"Maya Haddad",email:"admin@noura.test",passwordHash,role:Role.ADMIN,branchId:branch.id}});
  const cashier = await db.user.upsert({where:{email:"cashier@noura.test"},update:{},create:{name:"Omar Khalil",email:"cashier@noura.test",passwordHash,role:Role.CASHIER,branchId:branch.id}});
  const burgers = await db.category.create({data:{nameEn:"Burgers",nameAr:"برغر",sortOrder:1}}).catch(()=>db.category.findFirstOrThrow({where:{nameEn:"Burgers"}}));
  const drinks = await db.category.create({data:{nameEn:"Drinks",nameAr:"مشروبات",sortOrder:2}}).catch(()=>db.category.findFirstOrThrow({where:{nameEn:"Drinks"}}));
  await db.product.upsert({where:{sku:"BRG-001"},update:{},create:{sku:"BRG-001",price:8.5,categoryId:burgers.id,translations:{create:[{locale:"en",name:"Truffle Smash",description:"Double beef, truffle aioli"},{locale:"ar",name:"برغر الترفل",description:"لحم مزدوج وصوص ترفل"}]},sizes:{create:[{nameEn:"Regular",nameAr:"عادي",priceDelta:0},{nameEn:"Double",nameAr:"دبل",priceDelta:2.5}]},addons:{create:[{nameEn:"Extra cheese",nameAr:"جبنة إضافية",price:1},{nameEn:"No onion",nameAr:"بدون بصل",price:0}]}}});
  await db.product.upsert({where:{sku:"DRK-001"},update:{},create:{sku:"DRK-001",price:4.25,categoryId:drinks.id,translations:{create:[{locale:"en",name:"Iced Pistachio",description:"Espresso, milk, pistachio"},{locale:"ar",name:"فستق مثلج",description:"إسبريسو وحليب وفستق"}]},sizes:{create:[{nameEn:"Regular",nameAr:"عادي",priceDelta:0},{nameEn:"Large",nameAr:"كبير",priceDelta:1}]},addons:{create:{nameEn:"Extra shot",nameAr:"شوت إضافي",price:1}}}});
  await db.auditLog.create({data:{userId:cashier.id,action:"SEED_CREATED",entityType:"System",metadata:{version:1}}});
  console.log("Seed complete — admin@noura.test / cashier@noura.test (Demo123!)");
}
main().finally(()=>db.$disconnect());

