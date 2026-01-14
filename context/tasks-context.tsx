import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Task, TaskDraft, createTask, sortTasks } from '@/lib/tasks';

const STORAGE_KEY = 'disciplina.tasks.v1';

type TasksContextValue = {
  tasks: Task[];
  loading: boolean;
  addTask: (draft: TaskDraft) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (next: Task[]) => {
    setTasks(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setTasks([]);
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw) as Task[];
      setTasks(sortTasks(parsed));
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (draft: TaskDraft) => {
      const task = createTask(draft);
      const next = sortTasks([task, ...tasks]);
      await persist(next);
    },
    [persist, tasks],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const next = sortTasks(
        tasks.map((task) =>
          task.id === id
            ? { ...task, status: task.status === 'done' ? 'pending' : 'done' }
            : task,
        ),
      );
      await persist(next);
    },
    [persist, tasks],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      const next = sortTasks(
        tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
      );
      await persist(next);
    },
    [persist, tasks],
  );

  const removeTask = useCallback(
    async (id: string) => {
      const next = tasks.filter((task) => task.id !== id);
      await persist(next);
    },
    [persist, tasks],
  );

  const value = useMemo(
    () => ({ tasks, loading, addTask, toggleTask, updateTask, removeTask, refresh }),
    [tasks, loading, addTask, toggleTask, updateTask, removeTask, refresh],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
}