import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pharmacyCount = await prisma.pharmacy.count();
  if (pharmacyCount > 0) return;

  const p1 = await prisma.pharmacy.create({
    data: {
      name: "داروخانه دکتر سلامی",
      licenseNo: "PH-1001",
      address: "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۰",
      phone: "021-88881234",
      city: "تهران",
      latitude: 35.7592,
      longitude: 51.4056,
      isVerified: true,
    },
  });

  const p2 = await prisma.pharmacy.create({
    data: {
      name: "داروخانه مرکزی رازی",
      licenseNo: "PH-1002",
      address: "تهران، خیابان انقلاب، روبروی دانشگاه تهران",
      phone: "021-66405555",
      city: "تهران",
      latitude: 35.7008,
      longitude: 51.3912,
      isVerified: true,
    },
  });

  const m1 = await prisma.medicine.create({
    data: {
      nameFa: "استامینوفن ۵۰۰ میلی‌گرم",
      nameEn: "Acetaminophen 500mg",
      genericName: "Acetaminophen",
      description: "مسکن و تب‌بر عمومی",
      requiresRecipe: false,
      category: "مسکن",
    },
  });

  const m2 = await prisma.medicine.create({
    data: {
      nameFa: "آموکسی‌سیلین ۵۰۰ میلی‌گرم",
      nameEn: "Amoxicillin 500mg",
      genericName: "Amoxicillin",
      description: "آنتی‌بیوتیک وسیع‌الطیف",
      requiresRecipe: true,
      category: "آنتی‌بیوتیک",
    },
  });

  const m3 = await prisma.medicine.create({
    data: {
      nameFa: "شربت دیفن‌هیدرامین",
      nameEn: "Diphenhydramine Syrup",
      genericName: "Diphenhydramine",
      description: "ضد حساسیت و ضد سرفه",
      requiresRecipe: false,
      category: "ضد حساسیت",
    },
  });

  await prisma.pharmacyInventory.createMany({
    data: [
      {
        medicineId: m1.id,
        pharmacyId: p1.id,
        priceToman: 25000,
        stock: 50,
        isAvailable: true,
      },
      {
        medicineId: m2.id,
        pharmacyId: p1.id,
        priceToman: 48000,
        stock: 20,
        isAvailable: true,
      },
      {
        medicineId: m1.id,
        pharmacyId: p2.id,
        priceToman: 24000,
        stock: 100,
        isAvailable: true,
      },
      {
        medicineId: m3.id,
        pharmacyId: p2.id,
        priceToman: 32000,
        stock: 15,
        isAvailable: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
