import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    const { id } = await context.params;

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "No autenticado" } as ApiResponse,
        { status: 401 }
      );
    }

    if (!hasRequiredRole(authUser.role, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, message: "No autorizado" } as ApiResponse,
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Usuario obtenido correctamente", data: { user } } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("[USER_GET_BY_ID]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    const { id } = await context.params;

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "No autenticado" } as ApiResponse,
        { status: 401 }
      );
    }

    if (!hasRequiredRole(authUser.role, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, message: "No autorizado" } as ApiResponse,
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true, name: true, email: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    const { name, email, role, status, password } = await req.json();
    const fieldErrors: Array<{ field: string; message: string }> = [];

    if (name !== undefined && (!name || name.trim().length < 2)) {
      fieldErrors.push({ field: "name", message: "Nombre inválido" });
    }

    if (email !== undefined && (!email || !email.includes("@"))) {
      fieldErrors.push({ field: "email", message: "Email inválido" });
    }

    if (role !== undefined && !["ADMIN", "MEDICO", "CLIENTE"].includes(role)) {
      fieldErrors.push({ field: "role", message: "Rol inválido" });
    }

    if (status !== undefined && !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      fieldErrors.push({ field: "status", message: "Estado inválido" });
    }

    if (password !== undefined && password.length < 6) {
      fieldErrors.push({ field: "password", message: "Contraseña inválida" });
    }

    if (fieldErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Error de validación", errors: fieldErrors } as ApiResponse,
        { status: 400 }
      );
    }

    if (email !== undefined) {
      const duplicateEmail = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          id: { not: id },
        },
        select: { id: true },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { success: false, message: "Ya existe un usuario con ese email" } as ApiResponse,
          { status: 409 }
        );
      }
    }

    let hashedPassword: string | undefined;
    if (password !== undefined) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        email: email !== undefined ? email.trim().toLowerCase() : undefined,
        role: role ?? undefined,
        status: status ?? undefined,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "user",
      entityId: id,
      userId: authUser.id,
      targetId: id,
      oldValues: {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
      },
      newValues: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });

    if (existingUser.role !== updatedUser.role) {
      await createAuditLog({
        action: "ROLE_CHANGE",
        entity: "user",
        entityId: id,
        userId: authUser.id,
        targetId: id,
        oldValues: { role: existingUser.role },
        newValues: { role: updatedUser.role },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario actualizado correctamente",
        data: { user: updatedUser },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);
    const { id } = await context.params;

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "No autenticado" } as ApiResponse,
        { status: 401 }
      );
    }

    if (!hasRequiredRole(authUser.role, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, message: "No autorizado" } as ApiResponse,
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await createAuditLog({
      action: "DELETE",
      entity: "user",
      entityId: id,
      userId: authUser.id,
      targetId: id,
      oldValues: { status: existingUser.status },
      newValues: { status: "INACTIVE" },
    });

    return NextResponse.json(
      { success: true, message: "Usuario desactivado correctamente" } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
