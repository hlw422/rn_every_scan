/**
 * useScanHistory Hook
 * 封装 AsyncStorage 扫码历史记录的 CRUD 操作
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储 key
const STORAGE_KEY = '@scan_history';
// 最大记录数
const MAX_HISTORY = 200;

// 扫码记录类型
export interface ScanRecord {
  id: string;
  data: string;
  type: string;
  timestamp: number;
}

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 判断是否为 URL
 */
export const isUrl = (text: string): boolean => {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * 格式化时间戳为可读时间
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  // 今天内
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && 
      date.getMonth() === yesterday.getMonth() && 
      date.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 更早
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export function useScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 加载历史记录
   */
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const parsed = JSON.parse(jsonValue) as ScanRecord[];
        setHistory(parsed);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 添加新记录
   */
  const addRecord = useCallback(async (data: string, type: string) => {
    try {
      const newRecord: ScanRecord = {
        id: generateId(),
        data,
        type,
        timestamp: Date.now(),
      };

      // 读取现有记录
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      let existing: ScanRecord[] = jsonValue ? JSON.parse(jsonValue) : [];
      
      // 添加到开头
      existing.unshift(newRecord);
      
      // 超出限制时截断
      if (existing.length > MAX_HISTORY) {
        existing = existing.slice(0, MAX_HISTORY);
      }
      
      // 保存
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      setHistory(existing);
      
      return newRecord;
    } catch (error) {
      console.error('添加记录失败:', error);
      return null;
    }
  }, []);

  /**
   * 删除单条记录
   */
  const deleteRecord = useCallback(async (id: string) => {
    try {
      const updated = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.error('删除记录失败:', error);
    }
  }, [history]);

  /**
   * 清空所有记录
   */
  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('清空记录失败:', error);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    addRecord,
    deleteRecord,
    clearHistory,
    refresh: loadHistory,
  };
}
