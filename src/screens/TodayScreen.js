import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import TaskCard from '@/components/TaskCard';
import { useTasks } from '@/context/TasksContext';
import { formatFullDate, getDateKey, parseDateKey } from '@/utils/dates';

// Peso usado para ordenar prioridades no top 3.
const priorityRank = { high: 3, medium: 2, low: 1 };

// Converte data/hora da tarefa em timestamp para ordenacao.
function getTaskTime(task) {
  const base = parseDateKey(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map((value) => Number(value));
    base.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }
  return base.getTime();
}

export default function TodayScreen() {
  const { tasks, toggleTask, loading } = useTasks();
  const today = new Date();
  const todayKey = getDateKey(today);

  // Tarefas do dia e pendencias para o painel principal.
  const todayTasks = tasks.filter((task) => task.dueDate === todayKey);
  const pendingToday = todayTasks.filter((task) => task.status === 'pending');
  const overdueTasks = tasks.filter(
    (task) => task.status === 'pending' && task.dueDate < todayKey,
  );

  // Top 3 por prioridade e horario.
  const topThree = [...pendingToday]
    .sort((a, b) => {
      const priorityDiff = priorityRank[b.priority] - priorityRank[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return getTaskTime(a) - getTaskTime(b);
    })
    .slice(0, 3);

  return (
    <View style={styles.page}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>Seu foco hoje</Text>
            <Text style={styles.title}>Disciplina</Text>
            <Text style={styles.date}>{formatFullDate(today)}</Text>
          </View>
          <Link href="/adicionar" asChild>
            <Pressable style={styles.addButton}>
              <MaterialIcons name="add" size={22} color="#1F2933" />
              <Text style={styles.addLabel}>Nova</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top 3 do dia</Text>
            <Text style={styles.sectionMeta}>{topThree.length} em foco</Text>
          </View>
          {loading ? (
            <Text style={styles.emptyText}>Carregando tarefas...</Text>
          ) : topThree.length ? (
            <View style={styles.focusStack}>
              {topThree.map((task) => (
                <View key={task.id} style={styles.focusCard}>
                  <View style={[styles.focusDot, { backgroundColor: '#C44536' }]} />
                  <View style={styles.focusInfo}>
                    <Text style={styles.focusTitle}>{task.title}</Text>
                    <Text style={styles.focusMeta}>{task.dueTime || 'Sem hora'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Sem tarefas criticas por agora.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoje</Text>
          {todayTasks.length ? (
            todayTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)
          ) : (
            <Text style={styles.emptyText}>Nada marcado para hoje.</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atrasadas</Text>
            <Link href="/overdue" style={styles.sectionLink}>
              Ver tudo
            </Link>
          </View>
          {overdueTasks.length ? (
            overdueTasks
              .slice(0, 2)
              .map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)
          ) : (
            <Text style={styles.emptyText}>Backlog zerado.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },
  glowTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#F5C6AA',
    opacity: 0.35,
    top: -120,
    right: -80,
  },
  glowBottom: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#B8E1DD',
    opacity: 0.35,
    bottom: -140,
    left: -120,
  },
  scroll: {
    padding: 24,
    paddingTop: 56,
    gap: 18,
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
    fontSize: 34,
    color: '#1F2933',
    marginTop: 4,
  },
  date: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#52606D',
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
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    color: '#1F2933',
  },
  sectionMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#7B8794',
  },
  sectionLink: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#C44536',
  },
  focusStack: {
    gap: 10,
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E3',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F2D6B8',
  },
  focusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  focusInfo: {
    flex: 1,
  },
  focusTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 15,
    color: '#1F2933',
  },
  focusMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#7B8794',
  },
});
