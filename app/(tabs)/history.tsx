/**
 * 历史记录页面
 * 展示扫码历史，支持点击查看详情和清空操作
 */
import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useScanHistory, ScanRecord, isUrl, formatTimestamp } from '@/hooks/useScanHistory';
import { usePremium } from '@/hooks/usePremium';
import { FREE_LIMITS } from '@/constants/premium';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPro } = usePremium();
  const { history, loading, clearHistory, refresh, maxHistory, isNearLimit } = useScanHistory(isPro);

  /**
   * 点击记录跳转到详情
   */
  const handlePressItem = useCallback(
    (item: ScanRecord) => {
      router.push({
        pathname: '/scan-result',
        params: { data: item.data, type: item.type },
      });
    },
    [router]
  );

  /**
   * 清空历史记录
   */
  const handleClear = useCallback(() => {
    if (history.length === 0) return;
    
    Alert.alert(
      '清空历史记录',
      '确定要清空所有扫码历史记录吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  }, [history.length, clearHistory]);

  /**
   * 导出 CSV
   */
  const handleExportCSV = useCallback(async () => {
    if (!isPro) {
      Alert.alert('Pro 专属功能', '导出功能需要升级到 Pro 会员', [
        { text: '取消', style: 'cancel' },
        { text: '查看详情', onPress: () => router.push('/premium') },
      ]);
      return;
    }

    if (history.length === 0) {
      Alert.alert('暂无数据', '没有可导出的扫码记录');
      return;
    }

    try {
      // 生成 CSV 内容
      const csvHeader = 'ID,内容,类型,时间\n';
      const csvRows = history.map(record => {
        const escapedData = `"${record.data.replace(/"/g, '""')}"`;
        const escapedType = `"${record.type.replace(/"/g, '""')}"`;
        const date = new Date(record.timestamp).toISOString();
        return `${record.id},${escapedData},${escapedType},${date}`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // 检查 documentDirectory 是否可用
      if (!FileSystem.documentDirectory) {
        // 备用方案：直接分享文本内容
        await Share.share({
          message: csvContent,
          title: '扫码历史记录',
        });
        return;
      }
      
      // 写入文件
      const fileName = `scan_history_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // 分享文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: '导出扫码历史',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        // 备用方案：分享文本内容
        await Share.share({
          message: csvContent,
          title: '扫码历史记录',
        });
      }
    } catch (error) {
      console.error('导出 CSV 失败:', error);
      Alert.alert('导出失败', `错误信息: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [isPro, history, router]);

  /**
   * 渲染单条记录
   */
  const renderItem = useCallback(
    ({ item }: { item: ScanRecord }) => {
      const isUrlType = isUrl(item.data);
      const icon = isUrlType ? 'link' : 'text-fields';
      const iconColor = isUrlType ? '#4ECDC4' : '#FF6B6B';
      
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePressItem(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.itemIcon, { backgroundColor: iconColor + '20' }]}>
            <MaterialIcons name={icon as any} size={24} color={iconColor} />
          </View>
          
          <View style={styles.itemContent}>
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="middle">
              {item.data}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.itemType}>{item.type}</Text>
              <Text style={styles.itemTime}>{formatTimestamp(item.timestamp)}</Text>
            </View>
          </View>
          
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      );
    },
    [handlePressItem]
  );

  /**
   * 空状态组件
   */
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="qr-code-scanner" size={80} color="#333" />
      <Text style={styles.emptyTitle}>暂无扫码记录</Text>
      <Text style={styles.emptyDesc}>
        扫描二维码或条形码后，记录将显示在这里
      </Text>
    </View>
  );

  /**
   * 列表分隔线
   */
  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* 标题栏 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>扫码历史</Text>
          {!isPro && (
            <Text style={styles.limitText}>
              {history.length}/{FREE_LIMITS.MAX_HISTORY} 条记录
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {!isPro && (
            <TouchableOpacity
              style={styles.proButton}
              onPress={() => router.push('/premium')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="workspace-premium" size={16} color="#FFD700" />
              <Text style={styles.proButtonText}>Pro</Text>
            </TouchableOpacity>
          )}
          {history.length > 0 && (
            <TouchableOpacity style={styles.headerButton} onPress={handleExportCSV} activeOpacity={0.7}>
              <MaterialIcons name="file-download" size={20} color={isPro ? '#00E5CC' : '#666'} />
            </TouchableOpacity>
          )}
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
              <Text style={styles.clearText}>清空</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* 额度提示 */}
      {isNearLimit && !isPro && (
        <View style={styles.limitBanner}>
          <MaterialIcons name="warning" size={20} color="#FFD700" />
          <Text style={styles.limitBannerText}>
            即将达到免费版上限，升级 Pro 解除限制
          </Text>
          <TouchableOpacity onPress={() => router.push('/premium')}>
            <Text style={styles.limitBannerLink}>升级</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 记录列表 */}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.listContentEmpty,
        ]}
        refreshing={loading}
        onRefresh={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  // 标题栏
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  clearText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  limitText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  // 列表
  listContent: {
    paddingBottom: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  // 单条记录
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A1A2E',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#2A2A3E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemTime: {
    fontSize: 12,
    color: '#666',
  },
  // 分隔线
  separator: {
    height: 1,
    backgroundColor: '#2A2A3E',
    marginLeft: 76, // icon width + margin
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  limitBannerText: {
    flex: 1,
    color: '#FFD700',
    fontSize: 14,
  },
  limitBannerLink: {
    color: '#00E5CC',
    fontSize: 14,
    fontWeight: '600',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  proButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
});
