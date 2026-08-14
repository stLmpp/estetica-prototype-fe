export interface DayWorkingHours {
  start: string;
  end: string;
}

export interface WeeklyWorkingHours {
  monday: DayWorkingHours | null;
  tuesday: DayWorkingHours | null;
  wednesday: DayWorkingHours | null;
  thursday: DayWorkingHours | null;
  friday: DayWorkingHours | null;
  saturday: DayWorkingHours | null;
  sunday: DayWorkingHours | null;
}

export type Weekday = keyof WeeklyWorkingHours;

export const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const EMPTY_WEEKLY_WORKING_HOURS: WeeklyWorkingHours = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
};

export function weekdayFromDate(date: string): Weekday {
  const jsDay = new Date(`${date}T00:00:00`).getDay();
  return WEEKDAYS[(jsDay + 6) % 7]!;
}

export function parseWorkingHours(json: string | null | undefined): WeeklyWorkingHours | null {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json) as WeeklyWorkingHours;
  } catch {
    return null;
  }
}

export function stringifyWorkingHours(value: WeeklyWorkingHours): string {
  return JSON.stringify(value);
}
