export function pad2(value: number) {
  return value.toString().padStart(2, '0');
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = (day + 6) % 7; // Monday start
  next.setDate(next.getDate() - diff);
  return next;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatWeekday(date: Date) {
  return WEEKDAYS[date.getDay()];
}

export function formatShortDate(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatFullDate(date: Date) {
  return `${formatWeekday(date)}, ${formatShortDate(date)}`;
}

export function formatTimeLabel(dueTime?: string) {
  if (!dueTime) {
    return 'Sem hora';
  }
  return dueTime;
}