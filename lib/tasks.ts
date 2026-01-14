import { formatTimeLabel, parseDateKey } from '@/lib/date';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'school' | 'home' | 'health';
export type TaskRepeat = 'none' | 'daily' | 'weekly';
export type TaskStatus = 'pending' | 'done';

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  category: TaskCategory;
  priority: TaskPriority;
  repeat: TaskRepeat;
  status: TaskStatus;
  createdAt: string;
};

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'status'> & { status?: TaskStatus };

export const categoryOptions = [
  { id: 'work' as const, label: 'Trabalho', color: '#D96C55' },
  { id: 'school' as const, label: 'Faculdade', color: '#2A9D8F' },
  { id: 'home' as const, label: 'Casa', color: '#577590' },
  { id: 'health' as const, label: 'Saude', color: '#F2A541' },
] as const;

export const priorityOptions = [
  { id: 'high' as const, label: 'Alta', color: '#C44536' },
  { id: 'medium' as const, label: 'Media', color: '#E38B29' },
  { id: 'low' as const, label: 'Baixa', color: '#2A9D8F' },
] as const;

export const repeatOptions = [
  { id: 'none' as const, label: 'Sem repeticao' },
  { id: 'daily' as const, label: 'Diaria' },
  { id: 'weekly' as const, label: 'Semanal' },
] as const;

export function createTask(draft: TaskDraft): Task {
  const now = new Date();
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description?.trim() || undefined,
    dueDate: draft.dueDate,
    dueTime: draft.dueTime?.trim() || undefined,
    category: draft.category,
    priority: draft.priority,
    repeat: draft.repeat,
    status: draft.status ?? 'pending',
    createdAt: now.toISOString(),
  };
}

export function getTaskTimestamp(task: Task) {
  const base = parseDateKey(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map((value) => Number(value));
    base.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }
  return base.getTime();
}

export function getPriorityScore(priority: TaskPriority) {
  if (priority === 'high') {
    return 3;
  }
  if (priority === 'medium') {
    return 2;
  }
  return 1;
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    const timeDiff = getTaskTimestamp(a) - getTaskTimestamp(b);
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return getPriorityScore(b.priority) - getPriorityScore(a.priority);
  });
}

export function getCategoryMeta(category: TaskCategory) {
  return categoryOptions.find((option) => option.id === category) ?? categoryOptions[0];
}

export function getPriorityMeta(priority: TaskPriority) {
  return priorityOptions.find((option) => option.id === priority) ?? priorityOptions[1];
}

export function getRepeatMeta(repeat: TaskRepeat) {
  return repeatOptions.find((option) => option.id === repeat) ?? repeatOptions[0];
}

export function getTaskMetaLine(task: Task) {
  const category = getCategoryMeta(task.category);
  const repeat = getRepeatMeta(task.repeat);
  const timeLabel = formatTimeLabel(task.dueTime);
  return `${category.label} • ${timeLabel} • ${repeat.label}`;
}

function createId() {
  const seed = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}-${seed}`;
}