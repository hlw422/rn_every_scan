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
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScanHistory, ScanRecord, isUrl, formatTimestamp } from '@/hooks/useScanHistory';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, loading, clearHistory, refresh } = useScanHistory();

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
        <Text style={styles.title}>扫码历史</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
            <Text style={styles.clearText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>
      
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
});
