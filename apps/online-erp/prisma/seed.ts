import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { ExpenseCategory, ExpenseFrequency, PrismaClient, Role } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
async function main() {
  const branch = await db.branch.upsert({ where:{code:"MAIN"}, update:{}, create:{name:"Main Branch",nameAr:"الفرع الرئيسي",code:"MAIN",address:"Ramallah, Palestine"} });
  await db.cashRegister.upsert({ where:{number:"REG-MAIN-01"}, update:{branchId:branch.id,active:true}, create:{name:"Main POS Register",number:"REG-MAIN-01",branchId:branch.id} });
  const ils = await db.currency.upsert({ where:{code:"ILS"}, update:{isBase:true,active:true}, create:{code:"ILS",name:"Israeli Shekel",nameAr:"شيكل إسرائيلي",isBase:true} });
  const usd = await db.currency.upsert({ where:{code:"USD"}, update:{active:true}, create:{code:"USD",name:"US Dollar",nameAr:"دولار أمريكي"} });
  const jod = await db.currency.upsert({ where:{code:"JOD"}, update:{active:true}, create:{code:"JOD",name:"Jordanian Dinar",nameAr:"دينار أردني"} });
  const denominations = [
    [ils.id, "ILS", [200,100,50,20,10,5,2,1]],
    [usd.id, "USD", [100,50,20,10,5,1]],
    [jod.id, "JOD", [50,20,10,5,1]],
  ] as const;
  for (const [currencyId, code, values] of denominations) {
    for (const [index, value] of values.entries()) {
      await db.currencyDenomination.upsert({ where:{currencyId_value:{currencyId,value}}, update:{active:true,sortOrder:index,label:`${value} ${code}`}, create:{currencyId,value,label:`${value} ${code}`,sortOrder:index} });
    }
  }
  await db.exchangeRate.create({data:{currencyId:ils.id,rateToBase:1,active:true}}).catch(()=>null);
  await db.exchangeRate.create({data:{currencyId:usd.id,rateToBase:3.65,active:true}}).catch(()=>null);
  await db.exchangeRate.create({data:{currencyId:jod.id,rateToBase:5.15,active:true}}).catch(()=>null);
  const passwordHash = await bcrypt.hash("Demo123!", 12);
  const admin = await db.user.upsert({where:{email:"admin@noura.test"},update:{},create:{name:"Maya Haddad",email:"admin@noura.test",passwordHash,role:Role.ADMIN,branchId:branch.id}});
  const cashier = await db.user.upsert({where:{email:"cashier@noura.test"},update:{},create:{name:"Omar Khalil",email:"cashier@noura.test",passwordHash,role:Role.CASHIER,branchId:branch.id}});
  const burgers = await db.category.create({data:{nameEn:"Burgers",nameAr:"برغر",sortOrder:1}}).catch(()=>db.category.findFirstOrThrow({where:{nameEn:"Burgers"}}));
  const drinks = await db.category.create({data:{nameEn:"Drinks",nameAr:"مشروبات",sortOrder:2}}).catch(()=>db.category.findFirstOrThrow({where:{nameEn:"Drinks"}}));
  const burger = await db.product.upsert({where:{sku:"BRG-001"},update:{},create:{id:"p1",sku:"BRG-001",price:8.5,categoryId:burgers.id,translations:{create:[{locale:"en",name:"Truffle Smash",description:"Double beef, truffle aioli"},{locale:"ar",name:"برغر الترفل",description:"لحم مزدوج وصوص ترفل"}]},sizes:{create:[{nameEn:"Regular",nameAr:"عادي",priceDelta:0},{nameEn:"Double",nameAr:"دبل",priceDelta:2.5}]},addons:{create:[{nameEn:"Extra cheese",nameAr:"جبنة إضافية",price:1},{nameEn:"No onion",nameAr:"بدون بصل",price:0}]}}});
  const drink = await db.product.upsert({where:{sku:"DRK-001"},update:{},create:{id:"p7",sku:"DRK-001",price:4.25,categoryId:drinks.id,translations:{create:[{locale:"en",name:"Iced Pistachio",description:"Espresso, milk, pistachio"},{locale:"ar",name:"فستق مثلج",description:"إسبريسو وحليب وفستق"}]},sizes:{create:[{nameEn:"Regular",nameAr:"عادي",priceDelta:0},{nameEn:"Large",nameAr:"كبير",priceDelta:1}]},addons:{create:{nameEn:"Extra shot",nameAr:"شوت إضافي",price:1}}}});
  const beef = await db.ingredient.create({data:{nameEn:"Beef patty",nameAr:"قطعة لحم",unit:"kg",purchaseCost:42,purchaseQty:10,unitCost:4.2}}).catch(()=>db.ingredient.findFirstOrThrow({where:{nameEn:"Beef patty"}}));
  const bun = await db.ingredient.create({data:{nameEn:"Brioche bun",nameAr:"خبز بريوش",unit:"piece",purchaseCost:18,purchaseQty:60,unitCost:.3}}).catch(()=>db.ingredient.findFirstOrThrow({where:{nameEn:"Brioche bun"}}));
  const sauce = await db.ingredient.create({data:{nameEn:"Truffle sauce",nameAr:"صوص ترفل",unit:"liter",purchaseCost:16,purchaseQty:2,unitCost:8}}).catch(()=>db.ingredient.findFirstOrThrow({where:{nameEn:"Truffle sauce"}}));
  const coffee = await db.ingredient.create({data:{nameEn:"Espresso beans",nameAr:"حبوب قهوة",unit:"kg",purchaseCost:28,purchaseQty:4,unitCost:7}}).catch(()=>db.ingredient.findFirstOrThrow({where:{nameEn:"Espresso beans"}}));
  await db.productIngredient.upsert({where:{productId_ingredientId:{productId:burger.id,ingredientId:beef.id}},update:{quantityUsed:.18},create:{productId:burger.id,ingredientId:beef.id,quantityUsed:.18}});
  await db.productIngredient.upsert({where:{productId_ingredientId:{productId:burger.id,ingredientId:bun.id}},update:{quantityUsed:1},create:{productId:burger.id,ingredientId:bun.id,quantityUsed:1}});
  await db.productIngredient.upsert({where:{productId_ingredientId:{productId:burger.id,ingredientId:sauce.id}},update:{quantityUsed:.04},create:{productId:burger.id,ingredientId:sauce.id,quantityUsed:.04}});
  await db.productIngredient.upsert({where:{productId_ingredientId:{productId:drink.id,ingredientId:coffee.id}},update:{quantityUsed:.018},create:{productId:drink.id,ingredientId:coffee.id,quantityUsed:.018}});
  await db.product.update({where:{id:burger.id},data:{currentCost:1.38}});
  await db.product.update({where:{id:drink.id},data:{currentCost:.13}});
  await db.operatingExpense.create({data:{title:"Monthly rent",category:ExpenseCategory.RENT,frequency:ExpenseFrequency.MONTHLY,amount:1200,expenseDate:new Date("2026-07-01"),branchId:branch.id,createdById:admin.id}}).catch(()=>null);
  await db.operatingExpense.create({data:{title:"Electricity",category:ExpenseCategory.ELECTRICITY,frequency:ExpenseFrequency.MONTHLY,amount:420,expenseDate:new Date("2026-07-03"),branchId:branch.id,createdById:admin.id}}).catch(()=>null);
  await db.auditLog.create({data:{userId:cashier.id,action:"SEED_CREATED",entityType:"System",metadata:{version:1}}});
  console.log("Seed complete — admin@noura.test / cashier@noura.test (Demo123!)");
}
main().finally(()=>db.$disconnect());
