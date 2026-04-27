import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { okResponse, errorResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("No autenticado", 401);
    const { id } = await context.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!schedule) return errorResponse("Horario no encontrado", 404);

    const isAdmin = hasRequiredRole(authUser.role, ["ADMIN"]);
    const isMedico = hasRequiredRole(authUser.role, ["MEDICO"]);
    const canView =
      isAdmin ||
      (isMedico && (schedule.userId === authUser.id || schedule.user.role === "CLIENTE")) ||
      schedule.userId === authUser.id;

    if (!canView) {
      return errorResponse("No autorizado", 403);
    }

    return okResponse("Horario obtenido correctamente", { schedule });
  } catch (error) {
    console.error("[SCHEDULE_GET_BY_ID]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("No autenticado", 401);
    if (!hasRequiredRole(authUser.role, ["ADMIN", "MEDICO"])) {
      return errorResponse("No autorizado para editar horarios", 403);
    }
    const { id } = await context.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: { user: { select: { role: true } } },
    });
    if (!schedule) return errorResponse("Horario no encontrado", 404);

    const isAdmin = hasRequiredRole(authUser.role, ["ADMIN"]);
    const isMedico = hasRequiredRole(authUser.role, ["MEDICO"]);
    const canEdit =
      isAdmin ||
      (isMedico && (schedule.userId === authUser.id || schedule.user.role === "CLIENTE"));
    if (!canEdit) {
      return errorResponse("No autorizado", 403);
    }

    const body = await req.json();
    const fieldErrors: Array<{ field: string; message: string }> = [];

    const newTitle =
      body.title !== undefined
        ? typeof body.title === "string" && body.title.trim().length >= 3
          ? body.title.trim()
          : null
        : undefined;

    if (newTitle === null) {
      fieldErrors.push({ field: "title", message: "Título inválido" });
    }

    const start = body.startTime !== undefined ? parseDate(body.startTime) : undefined;
    const end = body.endTime !== undefined ? parseDate(body.endTime) : undefined;

    if (body.startTime !== undefined && !start) {
      fieldErrors.push({ field: "startTime", message: "Fecha de inicio inválida" });
    }
    if (body.endTime !== undefined && !end) {
      fieldErrors.push({ field: "endTime", message: "Fecha de fin inválida" });
    }

    const finalStart = start ?? schedule.startTime;
    const finalEnd = end ?? schedule.endTime;
    const finalUserId = typeof body.userId === "string" ? body.userId : schedule.userId;

    if (finalStart >= finalEnd) {
      fieldErrors.push({ field: "endTime", message: "La fecha de fin debe ser mayor al inicio" });
    }

    if (fieldErrors.length > 0) {
      return errorResponse("Error de validación", 400, fieldErrors);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: finalUserId },
      select: { id: true, role: true },
    });
    if (!targetUser) return errorResponse("Usuario no encontrado", 404);

    if (isMedico && !isAdmin) {
      const allowed = targetUser.role === "CLIENTE" || finalUserId === authUser.id;
      if (!allowed) {
        return errorResponse("Manager solo puede editar horarios de su equipo", 403);
      }
    }

    const conflict = await prisma.schedule.findFirst({
      where: {
        id: { not: id },
        userId: finalUserId,
        status: "ACTIVE",
        startTime: { lt: finalEnd },
        endTime: { gt: finalStart },
      },
      select: { id: true },
    });
    if (conflict) return errorResponse("Conflicto de horario: existe un horario superpuesto", 409);

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        title: newTitle ?? undefined,
        description:
          body.description !== undefined
            ? typeof body.description === "string"
              ? body.description.trim()
              : null
            : undefined,
        startTime: start ?? undefined,
        endTime: end ?? undefined,
        userId: finalUserId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "schedule",
      entityId: id,
      scheduleId: id,
      userId: authUser.id,
      targetId: updated.userId,
      oldValues: {
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,
        userId: schedule.userId,
      },
      newValues: {
        title: updated.title,
        description: updated.description,
        startTime: updated.startTime,
        endTime: updated.endTime,
        status: updated.status,
        userId: updated.userId,
      },
    });

    return okResponse("Horario actualizado correctamente", { schedule: updated });
  } catch (error) {
    console.error("[SCHEDULE_PATCH]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("No autenticado", 401);
    if (!hasRequiredRole(authUser.role, ["ADMIN", "MEDICO"])) {
      return errorResponse("No autorizado para eliminar horarios", 403);
    }
    const { id } = await context.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: { user: { select: { role: true } } },
    });
    if (!schedule) return errorResponse("Horario no encontrado", 404);

    const isAdmin = hasRequiredRole(authUser.role, ["ADMIN"]);
    const isMedico = hasRequiredRole(authUser.role, ["MEDICO"]);
    const canDelete =
      isAdmin ||
      (isMedico && (schedule.userId === authUser.id || schedule.user.role === "CLIENTE"));
    if (!canDelete) {
      return errorResponse("No autorizado", 403);
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await createAuditLog({
      action: "DELETE",
      entity: "schedule",
      entityId: id,
      scheduleId: id,
      userId: authUser.id,
      targetId: updated.userId,
      oldValues: { status: schedule.status },
      newValues: { status: "CANCELLED" },
    });

    return okResponse("Horario cancelado correctamente", { schedule: updated });
  } catch (error) {
    console.error("[SCHEDULE_DELETE]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}

