import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave de armazenamento das configuracoes no AsyncStorage.
const STORAGE_KEY = 'disciplina.settings.v1';

// Valores padrao usados quando ainda nao existe configuracao salva.
export const DEFAULT_SETTINGS = {
  reminderEnabled: true,
  reminderMinutes: 15,
  summaryEnabled: false,
  summaryTime: '07:30',
  summaryNotificationId: null,
};

// Carrega configuracoes salvas e mescla com os valores padrao.
export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

// Salva o snapshot atual das configuracoes.
export async function saveSettings(settings) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
