import type { NextRequest } from "next/server";
import type { Role, UserStatus } from "@prisma/client";
import { verifyAccessToken } from "@/lib/jwt";
import { getPrisma } from "@/lib/db";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  name: string;
};

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const prisma = getPrisma();
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

