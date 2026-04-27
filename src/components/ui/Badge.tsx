type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const toneClass =
    tone === "success"
      ? "bg-green-100 text-green-800"
      : tone === "warning"
        ? "bg-amber-100 text-amber-800"
        : tone === "danger"
          ? "bg-red-100 text-red-800"
          : tone === "info"
            ? "bg-blue-100 text-blue-800"
            : "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{children}</span>;
}

