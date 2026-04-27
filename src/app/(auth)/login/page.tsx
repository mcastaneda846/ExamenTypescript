"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al iniciar sesión");
        return;
      }

      // Redirigir después del login
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Error del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-white to-[#ede9fe] flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <div className="w-full rounded-3xl border border-black/5 bg-white p-8 text-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-300">
          <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-black">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-black/80">
                Email
              </label>
              <input
                type="email"
                placeholder="tuemail@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-black placeholder:text-black/40 outline-none transition-all duration-200 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/80">
                Password
              </label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-black placeholder:text-black/40 outline-none transition-all duration-200 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20"
                required
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-[#a78bfa] transition hover:text-[#8b5cf6]"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#a78bfa] py-3 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#8b5cf6] disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/70">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-[#a78bfa] hover:underline"
            >
              Registrarse
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
