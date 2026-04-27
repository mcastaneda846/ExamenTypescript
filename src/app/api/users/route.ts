import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);

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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(
      {
        success: true,
        message: "Usuarios obtenidos correctamente",
        data: { users },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const authUser = await getAuthUser(req);

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

    const { name, email, password, role, status } = await req.json();
    const fieldErrors: Array<{ field: string; message: string }> = [];

    if (!name || name.trim().length < 2) {
      fieldErrors.push({ field: "name", message: "Nombre inválido" });
    }

    if (!email || !email.includes("@")) {
      fieldErrors.push({ field: "email", message: "Email inválido" });
    }

    if (!password || password.length < 6) {
      fieldErrors.push({ field: "password", message: "Contraseña inválida" });
    }

    if (role && !["ADMIN", "MEDICO", "CLIENTE"].includes(role)) {
      fieldErrors.push({ field: "role", message: "Rol inválido" });
    }

    if (status && !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      fieldErrors.push({ field: "status", message: "Estado inválido" });
    }

    if (fieldErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Error de validación", errors: fieldErrors } as ApiResponse,
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Ya existe un usuario con ese email" } as ApiResponse,
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role ?? "CLIENTE",
        status: status ?? "ACTIVE",
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
      action: "CREATE",
      entity: "user",
      entityId: newUser.id,
      userId: authUser.id,
      targetId: newUser.id,
      newValues: { role: newUser.role, status: newUser.status, email: newUser.email },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado correctamente",
        data: { user: newUser },
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("[USERS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
