import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { okResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return errorResponse("No autenticado", 401);
    }

    return okResponse("Usuario autenticado", { user: authUser });
  } catch (error) {
    console.error("[AUTH_ME]", error);
    return errorResponse("Error interno del servidor", 500);
  }
}
