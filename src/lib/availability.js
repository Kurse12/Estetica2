// Fallback for the moment before a branch is known. Every house is shut on
// Sunday at minimum; Palermo and Belgrano also close Monday, which is why the
// calendar and slot list below take the chosen branch's own closedWeekdays
// and hours rather than assuming this constant.
export const CLOSED_WEEKDAYS = [0];

export function slotPeriod(slot) {
  const hour = Number(slot.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// The calendar key is built from the LOCAL date parts on purpose.
// toISOString() anchors to UTC, so in Buenos Aires (UTC-3) every tap after
// 21:00 would key to the following day — and the confirmation would print a
// date the visitor never chose. The salon's day is the visitor's day.
export function dateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The mirror of dateToISO. new Date("2026-08-31") parses as UTC midnight and
// renders as the 30th here; these three arguments stay local.
export function isoToDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

// setMonth() on a date parked at day 31 can spill into the month after the
// one being asked for (31 Jan + 1 month lands on 3 Mar, not Feb) — pinning to
// day 1 first is what keeps "next month" from ever skipping a month.
export function addMonths(date, months) {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// A rectangular grid, Monday-first, sized to whatever the month actually
// needs (5 or 6 rows) rather than always 6 — a 6th row that's entirely next
// month's padding reads as a layout bug, not a calendar. Cells outside the
// target month are still real Dates (so the grid tiles cleanly); the caller
// decides whether to render them as blank padding.
export function getMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const firstOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const totalCells = Math.ceil((firstOffset + daysInMonth) / 7) * 7;
  const gridStart = addDays(first, -firstOffset);
  return Array.from({ length: totalCells }, (_, i) => {
    const date = addDays(gridStart, i);
    return { date, inMonth: date.getMonth() === monthDate.getMonth() };
  });
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isClosedDay(date, closedWeekdays = CLOSED_WEEKDAYS) {
  return closedWeekdays.includes(date.getDay());
}

export function isPastDay(date, now = new Date()) {
  return startOfDay(date) < startOfDay(now);
}

export function isBookableDay(date, now = new Date(), closedWeekdays = CLOSED_WEEKDAYS) {
  return !isPastDay(date, now) && !isClosedDay(date, closedWeekdays);
}

// A 09:00 slot is not bookable at 16:00 today. Only today needs the check:
// past days are already refused above, future days are always ahead. The
// backend's disponibilidad endpoint returns every slot inside business
// hours regardless of the current time, so this filter still has to run
// client-side after fetching.
export function isSlotInPast(date, slot, now = new Date()) {
  if (!isSameDay(date, now)) return false;
  const [hour, minute] = slot.split(":").map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hour, minute, 0, 0);
  return slotTime <= now;
}
