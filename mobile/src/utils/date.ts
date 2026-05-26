export const isAppointmentPast = (dateStr?: string, timeStr?: string): boolean => {
  if (!dateStr || !timeStr) return false;
  try {
    const [year, month, day] = dateStr.split('-');
    const timeParts = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (year && month && day && timeParts) {
      const aptDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(timeParts[1]), parseInt(timeParts[2]));
      return aptDate < new Date();
    }
  } catch (e) {
    console.error('Error parsing appointment date/time:', e);
  }
  return false;
};
