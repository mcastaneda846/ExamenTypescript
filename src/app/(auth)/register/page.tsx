"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FieldErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Indicador de fuerza de contraseña ──────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Mayúscula", ok: /[A-Z]/.test(password) },
    { label: "Minúscula", ok: /[a-z]/.test(password) },
    { label: "Número", ok: /\d/.test(password) },
  ];

  const score = checks.filter((c) => c.ok).length;
  const colors = ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#22c55e"];

  return (
    <div style={{ marginTop: "0.5rem" }}>
      {/* Barra de fuerza */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "0.5rem" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "3px",
              flex: 1,
              borderRadius: "2px",
              background: i < score ? colors[score] : "var(--border)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      {/* Checks */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {checks.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: "0.72rem",
              fontFamily: "var(--font-mono)",
              color: c.ok ? "#16a34a" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      // Limpiar error del campo cuando el usuario empieza a escribir
      if (fieldErrors[field])
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.errors?.length) {
          const fe: FieldErrors = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            fe[err.field as keyof FieldErrors] = err.message;
          });
          setFieldErrors(fe);
        } else {
          setApiError(data.message);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setApiError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-white to-[#ede9fe] flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <div className="w-full rounded-3xl border border-black/5 bg-white p-8 text-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-300">
          <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-black">
            Registrarse
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">
                {apiError}
              </p>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-black/80"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-black placeholder:text-black/40 outline-none transition-all duration-200 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 ${fieldErrors.email ? "border-red-400" : "border-gray-200"}`}
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
                disabled={loading}
              />
              {fieldErrors.email && (
                <span className="mt-1 block text-sm text-red-600">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-black/80"
              >
                Nombre
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={set("username")}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-black placeholder:text-black/40 outline-none transition-all duration-200 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 ${fieldErrors.username ? "border-red-400" : "border-gray-200"}`}
                placeholder="Tu nombre"
                autoComplete="username"
                disabled={loading}
              />
              {fieldErrors.username && (
                <span className="mt-1 block text-sm text-red-600">
                  {fieldErrors.username}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-black/80"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={set("password")}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-black placeholder:text-black/40 outline-none transition-all duration-200 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 ${fieldErrors.password ? "border-red-400" : "border-gray-200"}`}
                placeholder="********"
                autoComplete="new-password"
                disabled={loading}
              />
              <PasswordStrength password={form.password} />
              {fieldErrors.password && (
                <span className="mt-1 block text-sm text-red-600">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-black/80"
              >
                Confirmar password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-black placeholder:text-black/40 outline-none transition-all duration-200 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 ${fieldErrors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                placeholder="********"
                autoComplete="new-password"
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <span className="mt-1 block text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-[#a78bfa] py-3 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#8b5cf6] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Registrarse"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/70">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-[#a78bfa] hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
