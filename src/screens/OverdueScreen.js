import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import TaskCard from '@/components/TaskCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTasks } from '@/context/TasksContext';
import { getDateKey } from '@/utils/dates';

export default function OverdueScreen() {
  const { tasks, toggleTask, refresh } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const todayKey = getDateKey(new Date());
  // Filtra tarefas pendentes com data anterior a hoje.
  const overdueTasks = tasks.filter((task) => task.status === 'pending' && task.dueDate < todayKey);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={styles.page}>
      <View style={styles.glow} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#C44536" />
        }>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>Resolver</Text>
            <Text style={styles.title}>Atrasadas</Text>
            <Text style={styles.subtitle}>{overdueTasks.length} pendentes</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.refreshButton} onPress={handleRefresh}>
              <IconSymbol size={20} name="arrow.clockwise" color="#1F2933" />
            </Pressable>
            <Link href="/adicionar" asChild>
              <Pressable style={styles.addButton}>
                <MaterialIcons name="add" size={22} color="#1F2933" />
                <Text style={styles.addLabel}>Nova</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {overdueTasks.length ? (
          overdueTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Tudo em dia.</Text>
            <Text style={styles.emptyText}>Nada atrasado para limpar agora.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5EFE8',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F6B5A2',
    opacity: 0.25,
    top: -110,
    right: -120,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#52606D',
    marginTop: 6,
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCEFD8',
    borderWidth: 1,
    borderColor: '#E6D5C1',
  },
  addLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#1F2933',
  },
  emptyState: {
    borderRadius: 20,
    backgroundColor: '#FFF9F1',
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  emptyTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
    color: '#1F2933',
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
});
