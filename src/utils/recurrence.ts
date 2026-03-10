import { format, addDays, addMonths, parseISO, isBefore, isSameDay, getDay, startOfMonth, endOfMonth } from 'date-fns';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'monthly_nth';

export interface RecurrenceRule {
  frequency: string;
  interval: number;
  weekDays: number[];
  nth: number;
  endDate: string;
}

export interface BaseSchedule {
  start_time: string;
  end_time: string;
  capacity: number;
  location: string;
  date?: string;
}

export const getNthWeekdayOfMonth = (date: Date, nthValue: number, dayOfWeek: number) => {
  let count = 0;
  let d = startOfMonth(date);
  const month = d.getMonth();
  
  if (nthValue <= 4) {
    while (d.getMonth() === month) {
      if (getDay(d) === dayOfWeek) {
        count++;
        if (count === nthValue) return d;
      }
      d = addDays(d, 1);
    }
  } else {
    // Last weekday
    d = endOfMonth(date);
    while (d.getMonth() === month) {
      if (getDay(d) === dayOfWeek) return d;
      d = addDays(d, -1);
    }
  }
  return null;
};

export const generateSchedules = (rule: RecurrenceRule, baseSchedule: BaseSchedule, startDate: string) => {
  const { frequency, interval, weekDays, endDate, nth } = rule;
  const end = parseISO(endDate);
  const start = parseISO(startDate);
  
  let current = start;
  const newSchedules = [];

  while (isBefore(current, end) || isSameDay(current, end)) {
    if (frequency === 'daily') {
      newSchedules.push({ ...baseSchedule, date: format(current, 'yyyy-MM-dd') });
      current = addDays(current, interval);
    } else if (frequency === 'weekly') {
      if (weekDays.includes(getDay(current))) {
        newSchedules.push({ ...baseSchedule, date: format(current, 'yyyy-MM-dd') });
      }
      current = addDays(current, 1);
    } else if (frequency === 'monthly') {
      newSchedules.push({ ...baseSchedule, date: format(current, 'yyyy-MM-dd') });
      current = addMonths(current, interval);
    } else if (frequency === 'monthly_nth') {
      const targetDay = weekDays[0];
      const targetDate = getNthWeekdayOfMonth(current, nth, targetDay);
      if (targetDate && (isSameDay(targetDate, start) || isBefore(start, targetDate)) && (isBefore(targetDate, end) || isSameDay(targetDate, end))) {
        newSchedules.push({ ...baseSchedule, date: format(targetDate, 'yyyy-MM-dd') });
      }
      current = addMonths(current, 1);
    } else {
      break;
    }

    if (newSchedules.length > 100) break;
  }

  return newSchedules;
};
