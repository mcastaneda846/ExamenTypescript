"use client";

import { createContext, useCallback, useMemo, useState } from "react";
import { apiRequest } from "@/services/http";
import type { ApiResponse, ScheduleDto } from "@/types";

type ScheduleContextValue = {
  schedules: ScheduleDto[];
  loading: boolean;
  error: string | null;
  fetchSchedules: () => Promise<void>;
  createSchedule: (payload: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    userId?: string;
  }) => Promise<ApiResponse<{ schedule: ScheduleDto }>>;
};

export const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ schedules: ScheduleDto[] }>("/api/schedules", { method: "GET" });
      if (!res.success || !res.data) {
        setError(res.message);
        return;
      }
      setSchedules(res.data.schedules);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(
    async (payload: {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      userId?: string;
    }) => {
      const res = await apiRequest<{ schedule: ScheduleDto }>("/api/schedules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.success) await fetchSchedules();
      return res;
    },
    [fetchSchedules]
  );

  const value = useMemo(
    () => ({ schedules, loading, error, fetchSchedules, createSchedule }),
    [schedules, loading, error, fetchSchedules, createSchedule]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

