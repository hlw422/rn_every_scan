/**
 * StatCard 组件
 * 统计数据卡片
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export function StatCard({ icon, title, value, color = '#00E5CC', subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <MaterialIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2A3E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#B0B0B0',
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 10,
    marginTop: 4,
  },
});
