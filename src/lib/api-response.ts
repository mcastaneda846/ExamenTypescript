import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

type FieldError = { field: string; message: string };

export function okResponse<T>(message: string, data?: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponse<T>,
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number,
  errors?: FieldError[]
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    } as ApiResponse,
    { status }
  );
}

