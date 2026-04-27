import type { Role } from "@prisma/client";

export function hasRequiredRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}

