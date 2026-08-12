import { Temporal } from 'temporal-polyfill';

export function minutesToIsoDuration(minutes: number): string {
  return Temporal.Duration.from({ minutes }).round({ largestUnit: 'hours' }).toString();
}

export function isoDurationToMinutes(duration: string): number {
  return Temporal.Duration.from(duration).total({ unit: 'minutes' });
}
