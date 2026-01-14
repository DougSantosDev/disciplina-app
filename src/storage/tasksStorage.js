import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'disciplina.tasks.v1';

export async function loadTasks() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export async function saveTasks(tasks) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}