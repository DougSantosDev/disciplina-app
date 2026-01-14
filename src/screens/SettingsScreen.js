import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTasks } from '@/context/TasksContext';
import { getDateKey } from '@/utils/dates';
import {
  cancelNotification,
  notificationsSupported,
  scheduleDailySummary,
  scheduleTaskReminder,
} from '@/utils/notifications';

const timePattern = /^\d{2}:\d{2}$/;

export default function SettingsScreen() {
  const { settings, loading, updateSettings } = useSettings();
  const { tasks, updateTask } = useTasks();
  const [summaryTime, setSummaryTime] = useState(settings.summaryTime);
  const [error, setError] = useState('');

  // Mantem o input sincronizado com o estado salvo.
  useEffect(() => {
    setSummaryTime(settings.summaryTime);
  }, [settings.summaryTime]);

  // Liga/desliga lembretes e sincroniza notificacoes pendentes.
  const handleReminderToggle = async (value) => {
    if (!notificationsSupported) {
      setError('Notificacoes exigem development build.');
      return;
    }
    setError('');
    updateSettings({ reminderEnabled: value });

    if (value) {
      const todayKey = getDateKey(new Date());
      for (const task of tasks) {
        if (task.status !== 'pending') {
          continue;
        }
        if (task.notificationId) {
          continue;
        }
        if (task.dueDate < todayKey) {
          continue;
        }
        const notificationId = await scheduleTaskReminder(
          task,
          settings.reminderMinutes,
        );
        if (notificationId) {
          await updateTask(task.id, { notificationId });
        }
      }
      return;
    }

    for (const task of tasks) {
      if (task.notificationId) {
        await cancelNotification(task.notificationId);
        await updateTask(task.id, { notificationId: null });
      }
    }
  };

  // Liga/desliga o resumo diario e (re)agenda notificacao.
  const handleSummaryToggle = async (value) => {
    if (!notificationsSupported) {
      setError('Notificacoes exigem development build.');
      return;
    }
    setError('');
    if (value) {
      const notificationId = await scheduleDailySummary(summaryTime);
      updateSettings({
        summaryEnabled: true,
        summaryTime,
        summaryNotificationId: notificationId || null,
      });
      if (!notificationId) {
        setError('Ative as notificacoes no sistema.');
      }
      return;
    }

    if (settings.summaryNotificationId) {
      await cancelNotification(settings.summaryNotificationId);
    }
    updateSettings({ summaryEnabled: false, summaryNotificationId: null });
  };

  // Valida horario e reprograma o resumo quando ativo.
  const handleSummaryTimeEnd = async () => {
    if (!notificationsSupported) {
      setError('Notificacoes exigem development build.');
      return;
    }
    if (!timePattern.test(summaryTime)) {
      setError('Horario invalido.');
      return;
    }
    setError('');
    updateSettings({ summaryTime });

    if (settings.summaryEnabled) {
      if (settings.summaryNotificationId) {
        await cancelNotification(settings.summaryNotificationId);
      }
      const notificationId = await scheduleDailySummary(summaryTime);
      updateSettings({ summaryNotificationId: notificationId || null });
      if (!notificationId) {
        setError('Ative as notificacoes no sistema.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <View style={styles.glow} />
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Carregando ajustes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.glow} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>Controle o ritmo e as notificacoes.</Text>
        {!notificationsSupported ? (
          <Text style={styles.noticeText}>
            Notificacoes exigem development build. No Expo Go ficam desativadas.
          </Text>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lembretes</Text>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Aviso 15 min antes</Text>
              <Text style={styles.rowHint}>Liga o alerta padrao de cada tarefa.</Text>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={handleReminderToggle}
              disabled={!notificationsSupported}
              trackColor={{ false: '#D3CEC7', true: '#C44536' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo diario</Text>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Receber resumo da manha</Text>
              <Text style={styles.rowHint}>Uma lista rapida do dia.</Text>
            </View>
            <Switch
              value={settings.summaryEnabled}
              onValueChange={handleSummaryToggle}
              disabled={!notificationsSupported}
              trackColor={{ false: '#D3CEC7', true: '#2A9D8F' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Horario do resumo</Text>
            <TextInput
              value={summaryTime}
              onChangeText={setSummaryTime}
              onEndEditing={handleSummaryTimeEnd}
              placeholder="07:30"
              placeholderTextColor="#9AA5B1"
              editable={notificationsSupported}
              style={styles.input}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre o app</Text>
          <Text style={styles.aboutText}>
            Lembretes locais funcionam quando as notificacoes estao ativadas no sistema.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F6F2EA',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#A8DADC',
    opacity: 0.2,
    bottom: -120,
    right: -120,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#6B7280',
  },
  scroll: {
    padding: 24,
    paddingTop: 56,
    gap: 16,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 30,
    color: '#1F2933',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#52606D',
    marginTop: 4,
  },
  noticeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#8B6B5E',
  },
  card: {
    backgroundColor: '#FFF9F1',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7DDCF',
    gap: 12,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
    color: '#1F2933',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#1F2933',
  },
  rowHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#6B7280',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0D7CB',
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#1F2933',
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#C44536',
  },
  aboutText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#52606D',
  },
});
