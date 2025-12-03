export const getWeekDays = (startDate: Date = new Date()) => {
  const days = [];
  // Adjust to get Monday as start if needed, currently getting current week surrounding today
  // For simplicity in this view, let's show last 3 days, today, next 3 days
  const current = new Date(startDate);
  current.setDate(current.getDate() - 3);

  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const calculateCompletion = (total: number, completed: number) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};
