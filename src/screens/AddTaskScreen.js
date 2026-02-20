import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Fonts } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  REPEAT_OPTIONS,
  useTasks,
} from '@/context/TasksContext';
import { getDateKey, isValidDateKey } from '@/utils/dates';
import { scheduleTaskReminder } from '@/utils/notifications';

const timePattern = /^\d{2}:\d{2}$/;

export default function AddTaskScreen() {
  const { addTask, updateTask } = useTasks();
  const { settings } = useSettings();
  // Data padrao para novas tarefas.
  const todayKey = useMemo(() => getDateKey(new Date()), []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(todayKey);
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [repeat, setRepeat] = useState('none');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    router.replace('/');
  };

  // Valida e salva a tarefa, agendando lembrete se estiver ativo.
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Titulo obrigatorio.');
      return;
    }
    if (!isValidDateKey(dueDate)) {
      setError('Use a data no formato AAAA-MM-DD.');
      return;
    }
    if (dueTime && !timePattern.test(dueTime)) {
      setError('Use a hora no formato HH:MM.');
      return;
    }

    setError('');
    setSaving(true);
    const createdTask = await addTask({
      title: trimmedTitle,
      description,
      dueDate,
      dueTime: dueTime.trim(),
      category,
      priority,
      repeat,
    });

    // Agenda notificacao local quando habilitado.
    if (settings.reminderEnabled) {
      const notificationId = await scheduleTaskReminder(
        createdTask,
        settings.reminderMinutes,
      );
      if (notificationId) {
        await updateTask(createdTask.id, { notificationId });
      }
    }

    setSaving(false);
    handleClose();
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nova tarefa</Text>
        <Text style={styles.subtitle}>Organize seu dia sem friccao.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Titulo</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Estudar 1h"
            placeholderTextColor="#9AA5B1"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descricao</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Notas curtas (opcional)"
            placeholderTextColor="#9AA5B1"
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Data</Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-01-31"
              placeholderTextColor="#9AA5B1"
              style={styles.input}
            />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Hora</Text>
            <TextInput
              value={dueTime}
              onChangeText={setDueTime}
              placeholder="18:30"
              placeholderTextColor="#9AA5B1"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.optionsRow}>
            {CATEGORY_OPTIONS.map((option) => {
              const active = category === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setCategory(option.id)}
                  style={[styles.optionPill, active ? styles.optionPillActive : null]}>
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.optionsRow}>
            {PRIORITY_OPTIONS.map((option) => {
              const active = priority === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setPriority(option.id)}
                  style={[styles.optionPill, active ? styles.optionPillActive : null]}>
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Repeticao</Text>
          <View style={styles.optionsRow}>
            {REPEAT_OPTIONS.map((option) => {
              const active = repeat === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setRepeat(option.id)}
                  style={[styles.optionPill, active ? styles.optionPillActive : null]}>
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable onPress={handleClose} style={[styles.actionButton, styles.secondary]}>
            <Text style={styles.secondaryText}>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.actionButton, saving ? styles.disabled : null]}>
            <Text style={styles.primaryText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F9F2E8',
  },
  scroll: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 60,
    gap: 16,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    color: '#1F2933',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#52606D',
    marginTop: 4,
  },
  section: {
    gap: 8,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#52606D',
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldHalf: {
    flex: 1,
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1E6D7',
    borderWidth: 1,
    borderColor: '#E0D7CB',
  },
  optionPillActive: {
    backgroundColor: '#C44536',
    borderColor: '#C44536',
  },
  optionText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#4B5563',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#C44536',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C44536',
  },
  secondary: {
    backgroundColor: '#F1E6D7',
    borderWidth: 1,
    borderColor: '#E0D7CB',
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#FFFFFF',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#1F2933',
  },
}
);
