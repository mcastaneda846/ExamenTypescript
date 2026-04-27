export function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

