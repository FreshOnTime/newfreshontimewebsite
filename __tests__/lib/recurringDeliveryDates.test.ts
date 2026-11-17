import { RecurringOrderService, type RecurringOrderPattern } from '@/lib/services/recurringOrderService';

jest.mock('@/lib/prisma', () => ({}));
jest.mock('@/lib/services/mailService', () => ({}));

const weekly = 'DTSTART:20260103T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=SA;COUNT=3';
const date = (day: string) => new Date(day);
function next(recurrence: RecurringOrderPattern['recurrence'], after: string) {
  return RecurringOrderService.calculateNextDelivery({ recurrence } as RecurringOrderPattern, date(after))?.toISOString() ?? null;
}

test('uses an extra Friday, skips the excluded Saturday, then resumes the weekly rule', () => {
  const recurrence = {
    rruleString: weekly,
    includeDates: [date('2026-01-09')],
    excludeDates: [date('2026-01-10')],
  };
  expect(next(recurrence, '2026-01-03T10:00:00Z')).toBe('2026-01-09T00:00:00.000Z');
  expect(next(recurrence, '2026-01-09')).toBe('2026-01-17T10:00:00.000Z');
});

test('a duplicate inclusion yields a single delivery and an exhausted rule stays exhausted', () => {
  const recurrence = { rruleString: weekly, daysOfWeek: [6], includeDates: [date('2026-01-10')] };
  expect(next(recurrence, '2026-01-04')).toBe('2026-01-10T10:00:00.000Z');
  expect(next(recurrence, '2026-01-10T10:00:00Z')).toBe('2026-01-17T10:00:00.000Z');
  expect(next(recurrence, '2026-01-17T10:00:00Z')).toBeNull();
});

test('exclusions override inclusions and an earlier weekday wins for legacy schedules', () => {
  const recurrence = { daysOfWeek: [6], includeDates: [date('2026-01-09'), date('2026-01-16')], excludeDates: [date('2026-01-09')] };
  expect(next(recurrence, '2026-01-04')).toBe('2026-01-10T00:00:00.000Z');
});
