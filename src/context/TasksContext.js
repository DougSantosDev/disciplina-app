import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadTasks, saveTasks } from '@/storage/tasksStorage';
import { parseDateKey } from '@/utils/dates';
import { cancelNotification } from '@/utils/notifications';

// Opcoes fixas usadas nos filtros e seletores.
export const CATEGORY_OPTIONS = [
  { id: 'work', label: 'Trabalho', color: '#D96C55' },
  { id: 'school', label: 'Faculdade', color: '#2A9D8F' },
  { id: 'home', label: 'Casa', color: '#577590' },
  { id: 'health', label: 'Saude', color: '#F2A541' },
];

export const PRIORITY_OPTIONS = [
  { id: 'high', label: 'Alta', color: '#C44536' },
  { id: 'medium', label: 'Media', color: '#E38B29' },
  { id: 'low', label: 'Baixa', color: '#2A9D8F' },
];

export const REPEAT_OPTIONS = [
  { id: 'none', label: 'Sem repeticao' },
  { id: 'daily', label: 'Diaria' },
  { id: 'weekly', label: 'Semanal' },
];

// Contexto central de tarefas (CRUD + persistencia).
const TasksContext = createContext(null);

// Gera um id simples para tarefas locais.
function createId() {
  const seed = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}-${seed}`;
}

// Pontua prioridade para ordenar tarefas.
function getPriorityScore(priority) {
  if (priority === 'high') {
    return 3;
  }
  if (priority === 'medium') {
    return 2;
  }
  return 1;
}

// Converte data/hora da tarefa em timestamp para ordenacao.
function getTaskTimestamp(task) {
  const base = parseDateKey(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map((value) => Number(value));
    base.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }
  return base.getTime();
}

// Ordena: pendentes primeiro, depois por horario e prioridade.
function sortTasks(tasks) {
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

// Helpers para metadados usados na UI.
export function getCategoryMeta(category) {
  return CATEGORY_OPTIONS.find((option) => option.id === category) ?? CATEGORY_OPTIONS[0];
}

export function getPriorityMeta(priority) {
  return PRIORITY_OPTIONS.find((option) => option.id === priority) ?? PRIORITY_OPTIONS[1];
}

export function getRepeatMeta(repeat) {
  return REPEAT_OPTIONS.find((option) => option.id === repeat) ?? REPEAT_OPTIONS[0];
}

// Normaliza dados e cria uma tarefa persistivel.
function createTask(draft) {
  const now = new Date();
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description?.trim() || '',
    dueDate: draft.dueDate,
    dueTime: draft.dueTime?.trim() || '',
    category: draft.category,
    priority: draft.priority,
    repeat: draft.repeat,
    status: draft.status ?? 'pending',
    notificationId: null,
    createdAt: now.toISOString(),
  };
}

// Provider com carga inicial do storage e operacoes CRUD.
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persistencia com atualizacao em memoria e AsyncStorage.
  const persist = useCallback((updater) => {
    setTasks((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      void saveTasks(next);
      return next;
    });
  }, []);

  // Recarrega tarefas do storage.
  const refresh = useCallback(async () => {
    setLoading(true);
    const stored = await loadTasks();
    setTasks(sortTasks(stored));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Adiciona tarefa e devolve o objeto criado.
  const addTask = useCallback(
    async (draft) => {
      const task = createTask(draft);
      persist((current) => sortTasks([task, ...current]));
      return task;
    },
    [persist],
  );

  // Alterna status; se concluir, cancela notificacao agendada.
  const toggleTask = useCallback(
    async (id) => {
      persist((current) =>
        sortTasks(
          current.map((task) => {
            if (task.id !== id) {
              return task;
            }
            const nextStatus = task.status === 'done' ? 'pending' : 'done';
            if (nextStatus === 'done' && task.notificationId) {
              void cancelNotification(task.notificationId);
              return { ...task, status: nextStatus, notificationId: null };
            }
            return { ...task, status: nextStatus };
          }),
        ),
      );
    },
    [persist],
  );

  // Atualiza propriedades mantendo ordenacao.
  const updateTask = useCallback(
    async (id, patch) => {
      persist((current) =>
        sortTasks(current.map((task) => (task.id === id ? { ...task, ...patch } : task))),
      );
    },
    [persist],
  );

  // Remove tarefa e cancela notificacao ligada.
  const removeTask = useCallback(
    async (id) => {
      persist((current) => {
        const target = current.find((task) => task.id === id);
        if (target?.notificationId) {
          void cancelNotification(target.notificationId);
        }
        return current.filter((task) => task.id !== id);
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({ tasks, loading, addTask, toggleTask, updateTask, removeTask, refresh }),
    [tasks, loading, addTask, toggleTask, updateTask, removeTask, refresh],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// Hook de consumo do contexto.
export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
}
