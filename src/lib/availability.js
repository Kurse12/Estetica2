// Deterministic pseudo-availability so the demo calendar feels alive without
// a backend: the same professional + date + slot always resolves the same way.
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const TIME_SLOTS = [
  "09:00", "09:45", "10:30", "11:15", "12:00",
  "13:30", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00",
];

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

// A branch's own opening hours narrow the fixed slot grid: Belgrano doesn't
// open until 10:00, so its 09:00 slot never appears; Recoleta closes at
// 18:00, so a slot starting there or later doesn't fit before close.
export function isSlotWithinHours(slot, openHour, closeHour) {
  const hour = Number(slot.split(":")[0]);
  return hour >= openHour && hour < closeHour;
}

// A 09:00 slot is not bookable at 16:00 today. Only today needs the check:
// past days are already refused above, future days are always ahead.
export function isSlotInPast(date, slot, now = new Date()) {
  if (!isSameDay(date, now)) return false;
  const [hour, minute] = slot.split(":").map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hour, minute, 0, 0);
  return slotTime <= now;
}

export function isSlotAvailable(professionalId, dateISO, slot) {
  const h = hashString(`${professionalId}|${dateISO}|${slot}`);
  return h % 5 !== 0 && h % 7 !== 0;
}

export function ticketNumberFor(professionalId, dateISO, slot, serviceId) {
  const h = hashString(`${professionalId}|${dateISO}|${slot}|${serviceId}|ticket`);
  return String(1000 + (h % 8999));
}
