import { db } from "./db";
import { categories } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const initialCategories = [
    {
      name: "General Discussion",
      description: "General tech discussions, announcements, and community topics",
      icon: "message-square",
      order: 1,
    },
    {
      name: "Security & Exploits",
      description: "Security research, vulnerability discussions, and exploit development",
      icon: "shield-alert",
      order: 2,
    },
    {
      name: "Programming",
      description: "Code, algorithms, languages, and development techniques",
      icon: "code",
      order: 3,
    },
    {
      name: "Cryptography",
      description: "Encryption, blockchain, cryptocurrency, and cryptographic protocols",
      icon: "lock",
      order: 4,
    },
    {
      name: "Tools & Resources",
      description: "Share and discuss tools, scripts, resources, and utilities",
      icon: "wrench",
      order: 5,
    },
    {
      name: "Off-Topic",
      description: "Everything else - gaming, hardware, lifestyle, and random discussions",
      icon: "coffee",
      order: 6,
    },
  ];

  for (const category of initialCategories) {
    const existing = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.name, category.name),
    });

    if (!existing) {
      await db.insert(categories).values(category);
      console.log(`Created category: ${category.name}`);
    }
  }

  console.log("Seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
