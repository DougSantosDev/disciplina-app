import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave de armazenamento das tarefas no AsyncStorage.
const STORAGE_KEY = 'disciplina.tasks.v1';

// Carrega tarefas salvas; em erro, retorna lista vazia.
export async function loadTasks() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

// Salva o snapshot atual das tarefas.
export async function saveTasks(tasks) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
