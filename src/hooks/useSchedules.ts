"use client";

import { useContext } from "react";
import { ScheduleContext } from "@/context/ScheduleContext";

export function useSchedules() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedules debe usarse dentro de ScheduleProvider");
  }
  return context;
}
