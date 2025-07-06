export function formatSessionDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  return `${datePart} ${timePart}`;
}