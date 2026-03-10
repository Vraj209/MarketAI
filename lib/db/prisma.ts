import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from ".prisma/client";

type PrismaGlobal = {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Prisma Neon adapter.");
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const prisma = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
