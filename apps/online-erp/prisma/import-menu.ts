import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const categories = [
  { key:"broast-single", ar:"البروست - فردي", en:"Broast · Individual", tags:["دجاج","مقلي","فردي","وجبة"], items:[
    ["وجبة 2 قطع بروست","2-piece Broast Meal",20,["دجاج","مقلي","فردي","وجبة"]], ["1 قطعة 2 كريسبي","1-piece · 2 Crispy",20,["دجاج","كريسبي","فردي"]], ["5 قطع كريسبي","5-piece Crispy",25,["دجاج","كريسبي","فردي"]], ["3 قطع 2 كريسبي","3-piece · 2 Crispy",34,["دجاج","كريسبي","فردي"]],
  ]},
  { key:"broast-family", ar:"البروست - عائلي", en:"Broast · Family", tags:["دجاج","مقلي","عائلي","للمشاركة"], items:[
    ["9 قطع بروست","9-piece Broast",75,["دجاج","مقلي","عائلي"]], ["12 قطعة بروست","12-piece Broast",95,["دجاج","مقلي","عائلي"]], ["15 قطعة بروست","15-piece Broast",110,["دجاج","مقلي","عائلي"]], ["21 قطعة بروست","21-piece Broast",150,["دجاج","مقلي","عائلي"]], ["5 قطع بروست و6 كريسبي","5 Broast + 6 Crispy",75,["دجاج","مقلي","عائلي","كريسبي"]], ["8 قطع بروست و9 كريسبي","8 Broast + 9 Crispy",110,["دجاج","مقلي","عائلي","كريسبي"]], ["12 كريسبي","12-piece Crispy",60,["دجاج","كريسبي","عائلي"]], ["16 كريسبي","16-piece Crispy",80,["دجاج","كريسبي","عائلي"]], ["25 كريسبي","25-piece Crispy",120,["دجاج","كريسبي","عائلي"]],
  ]},
  { key:"wings", ar:"الأجنحة", en:"Wings", tags:["دجاج","مقلي","للمشاركة"], items:[["8 قطع","8 pieces",20,["دجاج","مقلي","حجم صغير"]],["12 قطعة","12 pieces",28,["دجاج","مقلي","حجم متوسط"]],["30 قطعة","30 pieces",75,["دجاج","مقلي","حجم كبير","للمشاركة"]]] },
  { key:"shawarma-chicken", ar:"شاورما جاج", en:"Chicken Shawarma", tags:["شاورما","دجاج","وجبة","ساندويش"], items:[
    ["لفة","Shawarma Wrap",16,["دجاج","شاورما","لفة"]],["لفة شراك","Shawarma Saj Wrap",16,["دجاج","شاورما","لفة"]],["باجيت","Baguette",17,["دجاج","شاورما","ساندويش"]],["عصفورة","Small Shawarma",6,["دجاج","شاورما","فردي"]],["حبة سلايدر","Slider Piece",7,["دجاج","شاورما","ساندويش","فردي"]],["وجبة عربي","Arabic Meal",20,["دجاج","شاورما","وجبة"]],["وجبة عربي مع جبنة","Arabic Meal with Cheese",23,["دجاج","شاورما","وجبة","بالجبنة"]],["دبل عربي","Double Arabic",30,["دجاج","شاورما","وجبة"]],["دبل عربي مع جبنة","Double Arabic with Cheese",34,["دجاج","شاورما","وجبة","بالجبنة"]],["تربل عربي","Triple Arabic",40,["دجاج","شاورما","وجبة"]],["تربل عربي مع جبنة","Triple Arabic with Cheese",46,["دجاج","شاورما","وجبة","بالجبنة"]],["وجبة باشكا","Bashka Meal",25,["دجاج","شاورما","وجبة"]],["وايت صوص باشكا","Bashka with White Sauce",27,["دجاج","شاورما","وجبة","صوص"]],["وجبة عصافيري","Asafeeri Meal",27,["دجاج","شاورما","وجبة"]],["وجبة سلايدر","Slider Meal",28,["دجاج","شاورما","وجبة","ساندويش"]],["صحن شاورما جاج","Chicken Shawarma Plate",25,["دجاج","شاورما","صحن"]],["صحن شاورما جاج مع حمص","Chicken Shawarma Plate with Hummus",28,["دجاج","شاورما","صحن","مع حمص"]],
  ]},
  { key:"shawarma-beef", ar:"شاورما عجل", en:"Veal Shawarma", tags:["شاورما","لحم عجل","وجبة","ساندويش"], items:[
    ["لفة","Shawarma Wrap",20,["لحم عجل","شاورما","لفة"]],["لفة شراك","Shawarma Saj Wrap",20,["لحم عجل","شاورما","لفة"]],["باجيت","Baguette",20,["لحم عجل","شاورما","ساندويش"]],["عصفورة","Small Shawarma",7,["لحم عجل","شاورما","فردي"]],["حبة سلايدر","Slider Piece",8,["لحم عجل","شاورما","ساندويش","فردي"]],["وجبة عربي","Arabic Meal",24,["لحم عجل","شاورما","وجبة"]],["وجبة عربي مع جبنة","Arabic Meal with Cheese",27,["لحم عجل","شاورما","وجبة","بالجبنة"]],["دبل عربي","Double Arabic",36,["لحم عجل","شاورما","وجبة"]],["دبل عربي مع جبنة","Double Arabic with Cheese",40,["لحم عجل","شاورما","وجبة","بالجبنة"]],["تربل عربي","Triple Arabic",48,["لحم عجل","شاورما","وجبة"]],["تربل عربي مع جبنة","Triple Arabic with Cheese",54,["لحم عجل","شاورما","وجبة","بالجبنة"]],["وجبة باشكا","Bashka Meal",30,["لحم عجل","شاورما","وجبة"]],["وايت صوص باشكا","Bashka with White Sauce",32,["لحم عجل","شاورما","وجبة","صوص"]],["وجبة عصافيري","Asafeeri Meal",30,["لحم عجل","شاورما","وجبة"]],["وجبة سلايدر","Slider Meal",32,["لحم عجل","شاورما","وجبة","ساندويش"]],["صحن شاورما عجل","Veal Shawarma Plate",30,["لحم عجل","شاورما","صحن"]],["صحن شاورما عجل مع حمص","Veal Shawarma Plate with Hummus",33,["لحم عجل","شاورما","صحن","مع حمص"]],
  ]},
  { key:"sandwiches", ar:"الساندويشات", en:"Sandwiches", tags:["ساندويش","دجاج","وجبة سريعة"], items:[["بومر كريسبي","Boomer Crispy",18,["دجاج","كريسبي","ساندويش"]],["تورتيلا كريسبي","Crispy Tortilla",18,["دجاج","كريسبي","ساندويش","لفة"]],["فاهيتا","Fajita",18,["دجاج","مشوي","ساندويش"]],["صدر جاج عالفحم","Charcoal Grilled Chicken Breast",18,["دجاج","مشوي","ساندويش"]]] },
  { key:"appetizers", ar:"مقبلات", en:"Appetizers", tags:["مقبلات","جانبي","مشاركة"], items:[["فرايز تشكن","Chicken Fries",25,["دجاج","مقلي","مقبلات"]],["ديناميت جاج","Chicken Dynamite",25,["دجاج","مقبلات","حار"]],["ديناميت عجل","Veal Dynamite",30,["لحم عجل","مقبلات","حار"]],["سيزر كريسبي","Crispy Caesar",25,["دجاج","كريسبي","مقبلات"]],["بطاطا صغير","Small Fries",6,["بطاطا","مقلي","حجم صغير"]],["بطاطا كبير","Large Fries",8,["بطاطا","مقلي","حجم كبير","للمشاركة"]]] },
  { key:"sauces", ar:"صوصات", en:"Sauces", tags:["صوص","إضافة","جانبي"], items:[["متومة","Garlic Sauce",2,["صوص","ثوم"]],["كار صوص","Kar Sauce",2,["صوص"]],["كولسلو","Coleslaw",2,["صوص","بارد"]],["طحينية","Tahini",1,["صوص"]],["تشيلي","Chili Sauce",1,["صوص","حار"]]] },
  { key:"drinks", ar:"مشروبات", en:"Drinks", tags:["مشروب","بارد"], items:[["كولا أسود","Cola",3,["مشروب","بارد"]],["سفن أب","7UP",3,["مشروب","بارد"]],["كولا زيرو","Cola Zero",3,["مشروب","بارد","بدون سكر"]],["سناب","Snap",2,["مشروب","بارد"]],["كولا كبير","Large Cola",5,["مشروب","بارد","حجم كبير"]],["سفن أب كبير","Large 7UP",5,["مشروب","بارد","حجم كبير"]],["مياه صغير","Small Water",2,["مشروب","بارد","حجم صغير"]],["مياه كبير","Large Water",3,["مشروب","بارد","حجم كبير"]]] },
] as const;

async function main() {
  let created=0, updated=0;
  for (const [sortOrder, menuCategory] of categories.entries()) {
    const category = await db.category.findFirst({ where:{ OR:[{nameAr:menuCategory.ar},{nameEn:menuCategory.en}] } });
    const savedCategory = category
      ? await db.category.update({where:{id:category.id},data:{nameAr:menuCategory.ar,nameEn:menuCategory.en,tags:[...menuCategory.tags],sortOrder,active:true,deletedAt:null}})
      : await db.category.create({data:{nameAr:menuCategory.ar,nameEn:menuCategory.en,tags:[...menuCategory.tags],sortOrder}});
    for (const [index, [nameAr,nameEn,price,tags]] of menuCategory.items.entries()) {
      const existing = await db.product.findFirst({where:{categoryId:savedCategory.id,translations:{some:{locale:"ar",name:nameAr}}}});
      const sku = `MENU-${menuCategory.key.toUpperCase()}-${String(index+1).padStart(2,"0")}`;
      if (existing) {
        await db.product.update({where:{id:existing.id},data:{price,categoryId:savedCategory.id,tags:[...tags],active:true,deletedAt:null}});
        updated++;
      } else {
        const bySku=await db.product.findUnique({where:{sku}});
        if(bySku){await db.product.update({where:{id:bySku.id},data:{price,categoryId:savedCategory.id,tags:[...tags],active:true,deletedAt:null}});updated++;continue;}
        await db.product.create({data:{sku,price,categoryId:savedCategory.id,tags:[...tags],translations:{create:[{locale:"ar",name:nameAr},{locale:"en",name:nameEn}]}}});
        created++;
      }
    }
  }
  console.log(`Menu catalog imported. Categories: ${categories.length}; products created: ${created}; products updated: ${updated}.`);
}
main().finally(()=>db.$disconnect());
