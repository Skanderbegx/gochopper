import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_HUBS = [
  { slug: "hub-general", name: "General", description: "General discussion and announcements", emoji: "💬" },
  { slug: "hub-rd", name: "R&D", description: "Research and development projects", emoji: "🔬" },
  { slug: "hub-ops", name: "Operations", description: "Day-to-day operations and logistics", emoji: "⚙️" },
  { slug: "hub-engineering", name: "Engineering", description: "Technical implementation and architecture", emoji: "🛠️" },
  { slug: "hub-legal-ip", name: "Legal & IP", description: "Intellectual property and legal matters", emoji: "⚖️" },
  { slug: "hub-governance", name: "Governance", description: "Platform governance and decision-making", emoji: "🏛️" },
  { slug: "hub-sales", name: "Sales & Licensing", description: "Commercialization and licensing", emoji: "💰" },
  { slug: "hub-security", name: "Security", description: "Security audits, incidents, and policies", emoji: "🔒" },
];

async function main() {
  console.log("Seeding goChopper database (Supabase PostgreSQL)...");

  for (const hub of DEFAULT_HUBS) {
    await prisma.hub.upsert({
      where: { slug: hub.slug },
      update: {},
      create: hub,
    });
    console.log(`  ✓ Hub: ${hub.name}`);
  }

  console.log("\nSeeding complete!");
  console.log(`Created ${DEFAULT_HUBS.length} hubs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
