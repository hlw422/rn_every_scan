/**
 * usePremium Hook
 * 管理 Pro 会员状态
 */
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMIUM_STORAGE_KEY, PremiumFeature } from '@/constants/premium';

// 会员状态类型
export interface PremiumStatus {
  isPro: boolean;
  activatedAt?: number;
  expiresAt?: number; // undefined 表示永久
}

// 默认免费状态
const DEFAULT_STATUS: PremiumStatus = {
  isPro: false,
};

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  /**
   * 加载会员状态
   */
  const loadStatus = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      if (jsonValue) {
        const parsed = JSON.parse(jsonValue) as PremiumStatus;
        // 检查是否过期
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          setStatus(DEFAULT_STATUS);
          await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
        } else {
          setStatus(parsed);
        }
      } else {
        setStatus(DEFAULT_STATUS);
      }
    } catch (error) {
      console.error('加载会员状态失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 当页面获得焦点时自动刷新状态
   */
  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  /**
   * 激活 Pro（模拟购买成功）
   */
  const activatePro = useCallback(async (plan: 'monthly' | 'yearly' | 'lifetime') => {
    const now = Date.now();
    let expiresAt: number | undefined;

    switch (plan) {
      case 'monthly':
        expiresAt = now + 30 * 24 * 60 * 60 * 1000;
        break;
      case 'yearly':
        expiresAt = now + 365 * 24 * 60 * 60 * 1000;
        break;
      case 'lifetime':
        expiresAt = undefined; // 永久
        break;
    }

    const newStatus: PremiumStatus = {
      isPro: true,
      activatedAt: now,
      expiresAt,
    };

    await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(newStatus));
    setStatus(newStatus);
    return true;
  }, []);

  /**
   * 恢复购买（清除 Pro）
   */
  const deactivatePro = useCallback(async () => {
    await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
    setStatus(DEFAULT_STATUS);
  }, []);

  /**
   * 检查是否可以使用某功能
   */
  const canUseFeature = useCallback((feature: PremiumFeature): boolean => {
    // 某些功能免费版也可用
    return status.isPro;
  }, [status.isPro]);

  // 初始化
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return {
    isPro: status.isPro,
    status,
    loading,
    activatePro,
    deactivatePro,
    canUseFeature,
    refresh: loadStatus,
  };
}
