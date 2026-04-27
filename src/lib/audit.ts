import type { AuditAction, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";

type AuditJson = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

type CreateAuditLogInput = {
  action: AuditAction;
  entity: string;
  userId: string;
  entityId?: string;
  targetId?: string;
  scheduleId?: string;
  oldValues?: AuditJson;
  newValues?: AuditJson;
};

export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    const prisma = getPrisma();
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        userId: input.userId,
        entityId: input.entityId,
        targetId: input.targetId,
        scheduleId: input.scheduleId,
        oldValues: input.oldValues,
        newValues: input.newValues,
      },
    });
  } catch (error) {
    // No bloqueamos la operacion principal si falla la auditoria.
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}

