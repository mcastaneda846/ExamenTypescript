"use client";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const palette =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-500"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200";

  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 font-medium transition disabled:opacity-50 ${palette} ${className}`}
    />
  );
}
