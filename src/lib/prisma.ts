import { PrismaClient } from "@prisma/client";

// Crea la instancia de PrismaClient
const prisma = new PrismaClient();

// Exporta la instancia para usarla en la API
export { prisma };