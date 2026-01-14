import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import TaskCard from '@/components/TaskCard';
import { useTasks } from '@/context/TasksContext';
import { addDays, formatShortDate, formatWeekday, getDateKey, startOfWeek } from '@/utils/dates';

export default function WeekScreen() {
  const { tasks, toggleTask } = useTasks();
  const today = new Date();
  const todayKey = getDateKey(today);
  const weekStart = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <View style={styles.page}>
      <View style={styles.glow} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>Planejamento</Text>
            <Text style={styles.title}>Semana</Text>
          </View>
          <Link href="/modal" asChild>
            <Pressable style={styles.addButton}>
              <MaterialIcons name="add" size={22} color="#1F2933" />
              <Text style={styles.addLabel}>Nova</Text>
            </Pressable>
          </Link>
        </View>

        {days.map((day) => {
          const dayKey = getDateKey(day);
          const dayTasks = tasks.filter((task) => task.dueDate === dayKey);
          const isToday = dayKey === todayKey;

          return (
            <View key={dayKey} style={[styles.dayBlock, isToday ? styles.dayBlockActive : null]}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayLabel}>{formatWeekday(day)}</Text>
                  <Text style={styles.dayDate}>{formatShortDate(day)}</Text>
                </View>
                <View style={[styles.countPill, isToday ? styles.countPillActive : null]}>
                  <Text style={[styles.countText, isToday ? styles.countTextActive : null]}>
                    {dayTasks.length}
                  </Text>
                </View>
              </View>
              {dayTasks.length ? (
                dayTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)
              ) : (
                <Text style={styles.emptyText}>Sem tarefas para este dia.</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3F0E6',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#D9C2F0',
    opacity: 0.18,
    top: -100,
    left: -80,
  },
  scroll: {
    padding: 24,
    paddingTop: 56,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 32,
    color: '#1F2933',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCEFD8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6D5C1',
  },
  addLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#1F2933',
  },
  dayBlock: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFF9F1',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    gap: 12,
  },
  dayBlockActive: {
    borderColor: '#C44536',
    backgroundColor: '#FFF2E0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
    color: '#1F2933',
  },
  dayDate: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#6B7280',
  },
  countPill: {
    backgroundColor: '#F0E7D6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countPillActive: {
    backgroundColor: '#C44536',
  },
  countText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#1F2933',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#7B8794',
  },
});