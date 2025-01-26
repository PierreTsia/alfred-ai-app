export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toISOString();
};

export const formatDisplayDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};
