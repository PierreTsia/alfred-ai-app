export const formatDate = (date: number | Date): string => {
  return new Date(date).toLocaleDateString();
};

export const formatDisplayDate = (date: number | Date): string => {
  return new Date(date).toLocaleString();
}; 