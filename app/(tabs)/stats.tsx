/**
 * 扫码统计页面
 * 展示扫码数据分析
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useScanHistory } from '@/hooks/useScanHistory';
import { usePremium } from '@/hooks/usePremium';
import { useScanStats } from '@/hooks/useScanStats';
import { StatCard } from '@/components/StatCard';
import { ProGate } from '@/components/ProGate';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;

// 码制类型中文名称映射
const TYPE_NAMES: Record<string, string> = {
  'qr': '二维码',
  'ean13': 'EAN-13',
  'ean8': 'EAN-8',
  'upc_a': 'UPC-A',
  'upc_e': 'UPC-E',
  'code128': 'Code 128',
  'code39': 'Code 39',
  'code93': 'Code 93',
  'codabar': 'Codabar',
  'itf14': 'ITF-14',
  'aztec': 'Aztec',
  'datamatrix': 'Data Matrix',
  'pdf417': 'PDF417',
  'unknown': '未知',
};

function getTypeName(type: string): string {
  return TYPE_NAMES[type.toLowerCase()] || type.toUpperCase();
}

export default function StatsScreen() {
  const { isPro } = usePremium();
  const { history } = useScanHistory(isPro);
  const stats = useScanStats(history);

  // 码制分布数据
  const typeEntries = Object.entries(stats.typeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 最大扫码数（用于柱状图归一化）
  const maxDailyCount = Math.max(...stats.dailyTrend.map(d => d.count), 1);

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>扫码统计</Text>
        <Text style={styles.headerSubtitle}>数据分析报告</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 概览卡片 */}
        <View style={styles.statsRow}>
          <StatCard
            icon="qr-code-scanner"
            title="总扫码"
            value={stats.totalScans}
            color="#00E5CC"
          />
          <StatCard
            icon="today"
            title="今日"
            value={stats.todayScans}
            color="#4ECDC4"
          />
          <StatCard
            icon="date-range"
            title="本周"
            value={stats.weeklyScans}
            color="#FFD700"
          />
        </View>

        {/* 趋势图 */}
        <ProGate feature="高级统计分析" isLocked={!isPro}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>扫码趋势</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {stats.dailyTrend.map((day, index) => {
                  const barHeight = (day.count / maxDailyCount) * 120;
                  return (
                    <View key={index} style={styles.barGroup}>
                      <Text style={styles.barValue}>{day.count}</Text>
                      <View style={styles.barBackground}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: barHeight,
                              backgroundColor: day.count > 0 ? '#00E5CC' : '#3A3A4E',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{day.date}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </ProGate>

        {/* 码制分布 */}
        <ProGate feature="高级统计分析" isLocked={!isPro}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>码制分布</Text>
            {typeEntries.length > 0 ? (
              typeEntries.map(([type, count]) => {
                const percentage = ((count / stats.totalScans) * 100).toFixed(1);
                return (
                  <View key={type} style={styles.typeItem}>
                    <View style={styles.typeInfo}>
                      <Text style={styles.typeName}>{getTypeName(type)}</Text>
                      <Text style={styles.typeCount}>{count} 次</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.typePercentage}>{percentage}%</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="bar-chart" size={48} color="#3A3A4E" />
                <Text style={styles.emptyText}>暂无数据</Text>
              </View>
            )}
          </View>
        </ProGate>

        {/* 底部留白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#2A2A3E',
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    color: '#B0B0B0',
    fontSize: 10,
    marginBottom: 4,
  },
  barBackground: {
    width: 24,
    height: 120,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  barLabel: {
    color: '#B0B0B0',
    fontSize: 10,
    marginTop: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeCount: {
    color: '#B0B0B0',
    fontSize: 12,
  },
  progressBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E5CC',
    borderRadius: 4,
  },
  typePercentage: {
    color: '#00E5CC',
    fontSize: 14,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#B0B0B0',
    fontSize: 16,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 100,
  },
});
