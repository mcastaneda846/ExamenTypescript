import { PrismaClient } from "@/generated/prisma";

// Crea la instancia de PrismaClient
const prisma = new PrismaClient();

// Exporta la instancia para usarla en la API
export { prisma };