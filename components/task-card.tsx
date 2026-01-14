import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { formatTimeLabel } from '@/lib/date';
import { Task, getCategoryMeta, getPriorityMeta } from '@/lib/tasks';

type TaskCardProps = {
  task: Task;
  onToggle: (id: string) => void;
};

export function TaskCard({ task, onToggle }: TaskCardProps) {
  const category = getCategoryMeta(task.category);
  const priority = getPriorityMeta(task.priority);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.priorityBar, { backgroundColor: priority.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, task.status === 'done' ? styles.titleDone : null]}>
            {task.title}
          </Text>
          <Pressable
            onPress={() => onToggle(task.id)}
            style={({ pressed }) => [styles.toggle, pressed ? styles.togglePressed : null]}>
            <MaterialIcons
              name={task.status === 'done' ? 'check-circle' : 'radio-button-unchecked'}
              size={22}
              color={task.status === 'done' ? '#2A9D8F' : '#374151'}
            />
          </Pressable>
        </View>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={[styles.categoryPill, { backgroundColor: `${category.color}22` }]}> 
            <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
          </View>
          <Text style={styles.metaText}>{formatTimeLabel(task.dueTime)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F1',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7DDCF',
  },
  priorityBar: {
    width: 6,
    borderRadius: 10,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
    color: '#1F2933',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#7B8794',
  },
  description: {
    marginTop: 6,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: '#52606D',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#6B7280',
  },
  toggle: {
    padding: 4,
  },
  togglePressed: {
    opacity: 0.6,
  },
});