/**
 * useScanStats Hook
 * 计算扫码统计数据
 */
import { useState, useEffect, useCallback } from 'react';
import { ScanRecord } from './useScanHistory';

// 统计数据类型
export interface ScanStats {
  totalScans: number;
  todayScans: number;
  weeklyScans: number;
  typeDistribution: Record<string, number>;
  dailyTrend: { date: string; count: number }[];
}

export function useScanStats(history: ScanRecord[]) {
  const [stats, setStats] = useState<ScanStats>({
    totalScans: 0,
    todayScans: 0,
    weeklyScans: 0,
    typeDistribution: {},
    dailyTrend: [],
  });

  const calculateStats = useCallback(() => {
    if (!history.length) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // 计算本周一的日期（周一为一周开始）
    const dayOfWeek = now.getDay(); // 0=周日, 1=周一, ..., 6=周六
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日时需要往前推6天
    const weekStart = todayStart - daysFromMonday * 24 * 60 * 60 * 1000;

    // 今日扫码
    const todayScans = history.filter(r => r.timestamp >= todayStart).length;

    // 本周扫码（从周一开始）
    const weeklyScans = history.filter(r => r.timestamp >= weekStart).length;

    // 码制分布
    const typeDistribution: Record<string, number> = {};
    history.forEach(record => {
      const type = record.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // 每日趋势（最近7天）
    const dailyTrend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = todayStart - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = history.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd).length;
      const date = new Date(dayStart);
      dailyTrend.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      });
    }

    setStats({
      totalScans: history.length,
      todayScans,
      weeklyScans,
      typeDistribution,
      dailyTrend,
    });
  }, [history]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return stats;
}
