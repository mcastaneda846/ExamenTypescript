import { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma";
import { getPrisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { okResponse, errorResponse } from "@/lib/api-response";

function parseDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("No autenticado", 401);

    const isAdmin = hasRequiredRole(authUser.role, ["ADMIN"]);
    const isMedico = hasRequiredRole(authUser.role, ["MEDICO"]);

    const where: Prisma.ScheduleWhereInput | undefined = isAdmin
      ? undefined
      : isMedico
        ? {
            OR: [{ userId: authUser.id }, { user: { role: "CLIENTE" } }],
          }
        : { userId: authUser.id };

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return okResponse("Horarios obtenidos correctamente", { schedules });
  } catch (error) {
    console.error("[SCHEDULES_GET]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("No autenticado", 401);
    if (!hasRequiredRole(authUser.role, ["ADMIN", "MEDICO"])) {
      return errorResponse("No autorizado para crear horarios", 403);
    }

    const { title, description, startTime, endTime, userId } = await req.json();
    const fieldErrors: Array<{ field: string; message: string }> = [];

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      fieldErrors.push({ field: "title", message: "Título inválido" });
    }

    const start = parseDate(startTime);
    const end = parseDate(endTime);

    if (!start) fieldErrors.push({ field: "startTime", message: "Fecha de inicio inválida" });
    if (!end) fieldErrors.push({ field: "endTime", message: "Fecha de fin inválida" });
    if (start && end && start >= end) {
      fieldErrors.push({ field: "endTime", message: "La fecha de fin debe ser mayor al inicio" });
    }

    const isAdmin = hasRequiredRole(authUser.role, ["ADMIN"]);
    const isMedico = hasRequiredRole(authUser.role, ["MEDICO"]);
    const targetUserId = userId ?? authUser.id;

    if (!targetUserId || typeof targetUserId !== "string") {
      fieldErrors.push({ field: "userId", message: "Usuario inválido" });
    }

    if (fieldErrors.length > 0) {
      return errorResponse("Error de validación", 400, fieldErrors);
    }

    const userExists = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });
    if (!userExists) return errorResponse("Usuario no encontrado", 404);

    if (isMedico && !isAdmin) {
      const allowed = userExists.role === "CLIENTE" || targetUserId === authUser.id;
      if (!allowed) {
        return errorResponse("Manager solo puede crear horarios para su equipo", 403);
      }
    }

    const conflict = await prisma.schedule.findFirst({
      where: {
        userId: targetUserId,
        status: "ACTIVE",
        startTime: { lt: end! },
        endTime: { gt: start! },
      },
      select: { id: true, title: true, startTime: true, endTime: true },
    });

    if (conflict) {
      return errorResponse("Conflicto de horario: existe un horario superpuesto", 409);
    }

    const schedule = await prisma.schedule.create({
      data: {
        title: title.trim(),
        description: typeof description === "string" ? description.trim() : null,
        startTime: start!,
        endTime: end!,
        userId: targetUserId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await createAuditLog({
      action: "CREATE",
      entity: "schedule",
      entityId: schedule.id,
      scheduleId: schedule.id,
      userId: authUser.id,
      targetId: schedule.userId,
      newValues: {
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,
      },
    });

    return okResponse("Horario creado correctamente", { schedule }, 201);
  } catch (error) {
    console.error("[SCHEDULES_POST]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}

