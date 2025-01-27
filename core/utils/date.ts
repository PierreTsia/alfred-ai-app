export const formatDate = (date: number | Date): string => {
  return new Date(date).toLocaleDateString();
};

export const formatDisplayDate = (date: string ): string => {
  console.log(date);
  return new Date(date).toLocaleString();
}; 