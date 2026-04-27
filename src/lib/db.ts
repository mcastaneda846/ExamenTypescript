import { PrismaPg } from "@prisma/adapter-pg"; //Le dice a prisma como conectarse con Postgres se importa un adapter
import { PrismaClient } from "@prisma/client"; //Cliente ppal de prisma, se usa para hacer queries prisma.user...

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined;
};

export function getPrisma() {  //Fun obtener prisma
  if (!globalForPrisma.prisma) { //si no existe,la creamos
    const connectionString = process.env.DATABASE_URL; //lee bs desde .env
    if (!connectionString) {
      throw new Error("DATABASE_URL no está definida en variables de entorno"); //si no url, rompe app
    }
    const adapter = new PrismaPg({ connectionString }); //Inicializa adapter de postgr con la conex
    globalForPrisma.prisma = new PrismaClient({ adapter }); //crea cliente se guarda globalmente . evita multip conex, errores...
  }
  return globalForPrisma.prisma; //return la instancia (nueva o reutilizada)
}

/* “Este archivo centraliza la conexión a base de datos.
La función getPrisma() crea y reutiliza una instancia de PrismaClient usando el adapter PrismaPg, para Prisma 7.
Si no existe DATABASE_URL, lanza error claro.”
“Solo crea una conexión a la base de datos una vez, y reutilízala siempre” */