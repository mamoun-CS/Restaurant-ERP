export const products = [
  { id: "p1", nameEn: "Truffle Smash", nameAr: "برغر الترفل", descriptionEn: "Double beef, truffle aioli", descriptionAr: "لحم مزدوج وصوص ترفل", price: 8.5, category: "Burgers", categoryAr: "برغر", emoji: "🍔", color: "sand", active: true, sizes: [{nameEn:"Regular",nameAr:"عادي",delta:0},{nameEn:"Double",nameAr:"دبل",delta:2.5}], addons: [{nameEn:"Extra cheese",nameAr:"جبنة إضافية",price:1},{nameEn:"No onion",nameAr:"بدون بصل",price:0}] },
  { id: "p2", nameEn: "Crispy Chicken", nameAr: "دجاج مقرمش", descriptionEn: "Buttermilk chicken, slaw", descriptionAr: "دجاج مقرمش وسلطة ملفوف", price: 7.25, category: "Burgers", categoryAr: "برغر", emoji: "🥪", color: "peach", active: true, sizes: [], addons: [{nameEn:"Extra sauce",nameAr:"صوص إضافي",price:.5}] },
  { id: "p3", nameEn: "Margherita", nameAr: "مارغريتا", descriptionEn: "Tomato, basil, mozzarella", descriptionAr: "طماطم وريحان وموزاريلا", price: 9, category: "Pizza", categoryAr: "بيتزا", emoji: "🍕", color: "rose", active: true, sizes: [{nameEn:"Medium",nameAr:"وسط",delta:0},{nameEn:"Large",nameAr:"كبير",delta:3}], addons: [{nameEn:"Extra cheese",nameAr:"جبنة إضافية",price:1}] },
  { id: "p4", nameEn: "Pepperoni Fire", nameAr: "بيبروني حار", descriptionEn: "Pepperoni, chili honey", descriptionAr: "بيبروني وعسل حار", price: 10.5, category: "Pizza", categoryAr: "بيتزا", emoji: "🍕", color: "terracotta", active: true, sizes: [{nameEn:"Medium",nameAr:"وسط",delta:0},{nameEn:"Large",nameAr:"كبير",delta:3}], addons: [] },
  { id: "p5", nameEn: "Halloumi Bowl", nameAr: "سلطة حلوم", descriptionEn: "Grilled halloumi, grains", descriptionAr: "حلوم مشوي وحبوب", price: 7.75, category: "Bowls", categoryAr: "أطباق", emoji: "🥗", color: "sage", active: true, sizes: [], addons: [{nameEn:"Avocado",nameAr:"أفوكادو",price:1.5}] },
  { id: "p6", nameEn: "Loaded Fries", nameAr: "بطاطا محملة", descriptionEn: "Cheese, jalapeño, sauce", descriptionAr: "جبنة وهالبينو وصوص", price: 4.5, category: "Sides", categoryAr: "إضافات", emoji: "🍟", color: "gold", active: true, sizes: [{nameEn:"Small",nameAr:"صغير",delta:0},{nameEn:"Large",nameAr:"كبير",delta:1.5}], addons: [] },
  { id: "p7", nameEn: "Iced Pistachio", nameAr: "فستق مثلج", descriptionEn: "Espresso, milk, pistachio", descriptionAr: "إسبريسو وحليب وفستق", price: 4.25, category: "Drinks", categoryAr: "مشروبات", emoji: "🥤", color: "mint", active: true, sizes: [{nameEn:"Regular",nameAr:"عادي",delta:0},{nameEn:"Large",nameAr:"كبير",delta:1}], addons: [{nameEn:"Extra shot",nameAr:"شوت إضافي",price:1}] },
  { id: "p8", nameEn: "Tiramisu", nameAr: "تيراميسو", descriptionEn: "Espresso, mascarpone", descriptionAr: "إسبريسو وماسكربوني", price: 5, category: "Desserts", categoryAr: "حلويات", emoji: "🍰", color: "latte", active: true, sizes: [], addons: [] },
];
export const invoices = [
  { number:"INV-1048", time:"10:42 AM", date:"Jul 6, 2026", cashier:"Omar Khalil", branch:"Main Branch", items:3, total:24.50 },
  { number:"INV-1047", time:"10:31 AM", date:"Jul 6, 2026", cashier:"Lina Saad", branch:"Main Branch", items:5, total:41.25 },
  { number:"INV-1046", time:"10:16 AM", date:"Jul 6, 2026", cashier:"Omar Khalil", branch:"Garden Branch", items:2, total:16.75 },
  { number:"INV-1045", time:"9:58 AM", date:"Jul 6, 2026", cashier:"Lina Saad", branch:"Main Branch", items:4, total:32.00 },
  { number:"INV-1044", time:"9:42 AM", date:"Jul 6, 2026", cashier:"Omar Khalil", branch:"Main Branch", items:1, total:8.50 },
];
export const salesDays = [44,58,47,72,64,86,79,96,82,112,104,128,118,145];

