"use client";

import { FormEvent, useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { useAuth } from "@/hooks/useAuth";
import { useSchedules } from "@/hooks/useSchedules";
import { apiRequest } from "@/services/http";
import type { UserDto } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import ProfilePictureSelector from "@/components/ProfilePictureSelector";

type AuditLogItem = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "MEDICO") return "Médico";
  return "Paciente";
}

function DashboardContent() {
  const { user, loading, logout, isAdmin, isMedico, isCliente } = useAuth();
  const {
    schedules,
    fetchSchedules,
    createSchedule,
    loading: schedulesLoading,
  } = useSchedules();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    userId: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENTE",
  });

  useEffect(() => {
    if (!loading) {
      void fetchSchedules();
      if (isAdmin) {
        void loadUsers();
      }
      if (isAdmin || isMedico) {
        void loadAuditLogs();
      }
    }
  }, [loading, fetchSchedules, isAdmin, isMedico]);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const res = await apiRequest<{ users: UserDto[] }>("/api/users");
      if (res.success && res.data) setUsers(res.data.users);
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadAuditLogs() {
    setAuditLoading(true);
    try {
      const res = await apiRequest<{ logs: AuditLogItem[] }>(
        "/api/audit-logs?limit=20",
      );
      if (res.success && res.data) setAuditLogs(res.data.logs);
    } finally {
      setAuditLoading(false);
    }
  }

  async function handleCreateSchedule(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    const res = await createSchedule({
      title: scheduleForm.title,
      description: scheduleForm.description,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      userId: scheduleForm.userId || undefined,
    });

    if (!res.success) {
      setError(res.message);
      return;
    }

    setMessage("Horario creado correctamente");
    setScheduleForm({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      userId: "",
    });
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await apiRequest<{ user: UserDto }>("/api/users", {
      method: "POST",
      body: JSON.stringify(userForm),
    });

    if (!res.success) {
      setError(res.message);
      return;
    }

    setMessage("Usuario creado correctamente");
    setUserForm({ name: "", email: "", password: "", role: "CLIENTE" });
    await loadUsers();
  }

  if (loading) return <p className="p-8">Cargando sesión...</p>;
  if (!user)
    return <p className="p-8">No autenticado. Vuelve a iniciar sesión.</p>;

  return (
    <main className="min-h-screen bg-[#f8e1dc] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_-25px_rgba(244,114,182,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Horus Braslet
              </h1>
              <p className="mt-1 text-slate-800">Bienvenid@, {user.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {user.profileUrl ? (
                <img
                  src={user.profileUrl}
                  alt="Foto de perfil"
                  className="w-18 h-18 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <span>{user.name.charAt(0)}</span>
                </div>
              )}

              {/* Etiqueta de rol */}
              <Badge tone="info">{roleLabel(user.role)}</Badge>

              {/* Botón de Cerrar sesión */}
              <Button
                variant="secondary"
                onClick={logout}
                className="rounded-2xl text-slate-900"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </section>

        {message ? (
          <p className="rounded-xl bg-green-100 p-3 text-green-900 font-medium">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-red-100 p-3 text-red-900 font-medium">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {(isAdmin || isMedico) && (
            <Card title="Agenda Cita">
              <form className="space-y-3" onSubmit={handleCreateSchedule}>
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-500"
                  placeholder="Título"
                  value={scheduleForm.title}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-500"
                  placeholder="Descripción"
                  value={scheduleForm.description}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  type="datetime-local"
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  type="datetime-local"
                  value={scheduleForm.endTime}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-500"
                  placeholder="User ID (opcional para asignar)"
                  value={scheduleForm.userId}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      userId: e.target.value,
                    }))
                  }
                />
                <Button
                  type="submit"
                  className="rounded-2xl bg-[#f57f87] hover:bg-[#ef6f78] text-white"
                >
                  Guardar Cita
                </Button>
              </form>
            </Card>
          )}

          <Card
            title={`${
              isCliente ? "Mis Citas" : "Horarios"
            } ${schedulesLoading ? "(cargando...)" : `(${schedules.length})`}`}
          >
            <div className="max-h-80 space-y-2 overflow-auto">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-slate-300 bg-white p-3"
                >
                  <p className="font-semibold text-slate-900">{s.title}</p>
                  <p className="text-sm text-slate-800">
                    {new Date(s.startTime).toLocaleString()} -{" "}
                    {new Date(s.endTime).toLocaleString()}
                  </p>
                  <Badge tone={s.status === "ACTIVE" ? "success" : "warning"}>
                    {s.status}
                  </Badge>
                </div>
              ))}
              {schedules.length === 0 && (
                <p className="text-slate-700">No hay horarios aún.</p>
              )}
            </div>
          </Card>
        </div>

        {isAdmin && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Panel Admin: crear usuario">
              <form className="space-y-3" onSubmit={handleCreateUser}>
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  placeholder="Nombre"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  placeholder="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <select
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="MEDICO">MEDICO</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <Button
                  type="submit"
                  className="rounded-2xl bg-[#f57f87] hover:bg-[#ef6f78] text-white"
                >
                  Crear usuario
                </Button>
              </form>
            </Card>

            <Card
              title={`Panel Admin: usuarios ${usersLoading ? "(cargando...)" : `(${users.length})`}`}
            >
              <div className="max-h-80 space-y-2 overflow-auto">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-slate-300 bg-white p-3"
                  >
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-sm text-slate-800">{u.email}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge tone="info">{u.role}</Badge>
                      <Badge
                        tone={u.status === "ACTIVE" ? "success" : "warning"}
                      >
                        {u.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {(isAdmin || isMedico) && (
          <Card
            title={`${
              isAdmin ? "Panel de auditoría" : "Panel de auditoría"
            } ${auditLoading ? "(cargando...)" : `(${auditLogs.length})`}`}
          >
            <div className="max-h-80 space-y-2 overflow-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-300 bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge tone="info">{log.action}</Badge>
                    <Badge tone="neutral">{log.entity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-800">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-700">
                    {log.user?.name ?? "Sistema"} - {log.user?.email ?? "N/A"}
                  </p>
                </div>
              ))}
              {!auditLoading && auditLogs.length === 0 && (
                <p className="text-slate-700">No hay registros de auditoría.</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <DashboardContent />
      </ScheduleProvider>
    </AuthProvider>
  );
}
