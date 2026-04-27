import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { okResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("No autenticado", 401);

    const isAdmin = hasRequiredRole(authUser.role, ["ADMIN"]);
    const isMedico = hasRequiredRole(authUser.role, ["MEDICO"]);

    if (!isAdmin && !isMedico) {
      return errorResponse("No autorizado", 403);
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit") ?? "50");
    const safeLimit = Number.isNaN(limit) ? 50 : Math.min(Math.max(limit, 1), 100);

    const logs = await prisma.auditLog.findMany({
      where: isAdmin ? undefined : { OR: [{ userId: authUser.id }, { targetId: authUser.id }] },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        target: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return okResponse("Auditoría obtenida correctamente", { logs });
  } catch (error) {
    console.error("[AUDIT_LOGS_GET]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}

