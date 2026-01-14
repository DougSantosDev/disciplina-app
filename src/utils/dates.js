// Labels usados pelos formatadores de data na UI.
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Garante 2 digitos para montar chaves de data.
export function pad2(value) {
  return value.toString().padStart(2, '0');
}

// Normaliza para YYYY-MM-DD para armazenamento e comparacoes.
export function getDateKey(date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

// Converte YYYY-MM-DD de volta para Date (hora local).
export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day);
}

// Soma dias sem mutar a data original.
export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

// Encontra a segunda-feira da semana para uma data.
export function startOfWeek(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  return next;
}

// Helpers de formatacao para labels.
export function formatWeekday(date) {
  return WEEKDAYS[date.getDay()];
}

export function formatShortDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatFullDate(date) {
  return `${formatWeekday(date)}, ${formatShortDate(date)}`;
}

// Fallback quando nao ha hora informada.
export function formatTimeLabel(value) {
  return value && value.trim() ? value : 'Sem hora';
}

// Valida o formato YYYY-MM-DD e o valor.
export function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = parseDateKey(value);
  return getDateKey(parsed) === value;
}
