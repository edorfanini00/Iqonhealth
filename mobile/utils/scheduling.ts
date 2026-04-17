/**
 * Scheduling utility — shared between Today screen and CalendarGrid
 */

// Check if a compound is scheduled for a specific date string (YYYY-MM-DD)
export const isScheduledForDate = (comp: any, dateStr: string): boolean => {
  if (!comp.startDate) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const startD = new Date(comp.startDate + 'T00:00:00');
  const endD = comp.endDate ? new Date(comp.endDate + 'T00:00:00') : new Date('2099-01-01');
  if (d < startD || d > endD) return false;
  if (comp.scheduleType === 'daily') return true;
  if (comp.scheduleType === 'custom' && comp.scheduleDays?.length > 0) {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return comp.scheduleDays.includes(weekdays[d.getDay()]);
  }
  if (comp.scheduleType === 'everyX' && comp.scheduleInterval) {
    const diffDays = Math.floor(Math.abs(d.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays % parseInt(comp.scheduleInterval) === 0;
  }
  return false;
};
