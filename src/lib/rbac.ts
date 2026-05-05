import type { Role } from "@/generated/prisma";

export function hasRequiredRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}

