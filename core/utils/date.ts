export const formatDate = (date: number | Date): string => {
  return new Date(date).toLocaleDateString();
};

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
