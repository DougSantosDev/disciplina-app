import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { parseDateKey } from '@/utils/dates';

// Expo Go nao suporta notificacoes completas; web tambem nao.
const appOwnership = Constants.appOwnership ?? 'unknown';
const platformSupported = Platform.OS !== 'web';
export const notificationsSupported = platformSupported && appOwnership !== 'expo';

let notificationsPromise = null;
let handlerConfigured = false;
let channelConfigured = false;

// Importa o modulo apenas quando suportado.
async function getNotificationsModule() {
  if (!notificationsSupported) {
    return null;
  }
  if (!notificationsPromise) {
    notificationsPromise = import('expo-notifications');
  }
  return notificationsPromise;
}

// Garante handler padrao e canal no Android.
async function ensureConfigured() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return null;
  }
  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }
  if (Platform.OS === 'android' && !channelConfigured) {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Lembretes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C44536',
    });
    channelConfigured = true;
  }
  return Notifications;
}

// Solicita permissao ao usuario se necessario.
export async function ensureNotificationPermissions() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === 'granted') {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

// Valida horario HH:MM para o resumo diario.
function parseTime(value) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) {
    return null;
  }
  return { hour, minute };
}

// Calcula o horario de disparo para um lembrete.
function buildTriggerDate(task, minutesBefore) {
  const base = parseDateKey(task.dueDate);
  let hours = 9;
  let minutes = 0;
  if (task.dueTime) {
    const [rawHours, rawMinutes] = task.dueTime.split(':').map((value) => Number(value));
    hours = Number.isNaN(rawHours) ? 9 : rawHours;
    minutes = Number.isNaN(rawMinutes) ? 0 : rawMinutes;
  }
  base.setHours(hours, minutes, 0, 0);
  const offset = Number.isFinite(minutesBefore) ? minutesBefore : 15;
  const triggerTime = new Date(base.getTime() - offset * 60 * 1000);
  if (Number.isNaN(triggerTime.getTime()) || triggerTime <= new Date()) {
    return null;
  }
  return triggerTime;
}

// Agenda lembrete unico para uma tarefa.
export async function scheduleTaskReminder(task, minutesBefore) {
  const Notifications = await ensureConfigured();
  if (!Notifications) {
    return null;
  }
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return null;
  }
  const triggerDate = buildTriggerDate(task, minutesBefore);
  if (!triggerDate) {
    return null;
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tarefa chegando',
      body: task.title,
      sound: true,
    },
    trigger: {
      date: triggerDate,
      channelId: 'reminders',
    },
  });
}

// Agenda resumo diario recorrente.
export async function scheduleDailySummary(summaryTime) {
  const Notifications = await ensureConfigured();
  if (!Notifications) {
    return null;
  }
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return null;
  }
  const parsed = parseTime(summaryTime);
  if (!parsed) {
    return null;
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Resumo do dia',
      body: 'Veja suas tarefas para hoje.',
      sound: true,
    },
    trigger: {
      hour: parsed.hour,
      minute: parsed.minute,
      repeats: true,
      channelId: 'reminders',
    },
  });
}

// Cancela uma notificacao ja agendada.
export async function cancelNotification(notificationId) {
  if (!notificationId) {
    return;
  }
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
