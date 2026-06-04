/**
 * 批量扫描结果页面
 * 显示本次批量扫描的所有结果
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface ScanResult {
  data: string;
  type: string;
}

// 码制类型中文名称
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
};

function getTypeName(type: string): string {
  return TYPE_NAMES[type.toLowerCase()] || type.toUpperCase();
}

function isUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function BatchResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { results: resultsJson } = useLocalSearchParams<{ results: string }>();
  
  const results: ScanResult[] = resultsJson ? JSON.parse(resultsJson) : [];
  const timestamp = new Date().toLocaleString('zh-CN');

  /**
   * 点击单条结果
   */
  const handlePressItem = useCallback(
    (item: ScanResult) => {
      router.push({
        pathname: '/scan-result',
        params: { data: item.data, type: item.type },
      });
    },
    [router]
  );

  /**
   * 分享所有结果
   */
  const handleShareAll = useCallback(async () => {
    try {
      const content = results
        .map((r, i) => `${i + 1}. [${getTypeName(r.type)}] ${r.data}`)
        .join('\n');
      
      // 使用纯文本分享，避免微信解析成链接
      const shareContent = `批量扫码结果（共 ${results.length} 条）\n扫描时间：${timestamp}\n\n${content}`;
      
      // Android 需要同时提供 message 和 url，但 url 为空字符串
      // 这样微信会显示纯文本而不是链接卡片
      await Share.share({
        message: shareContent,
        url: '', // 空 url 避免链接预览
        title: '批量扫码结果',
      }, {
        // Android 特定选项：强制纯文本分享
        dialogTitle: '分享扫码结果',
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  }, [results, timestamp]);

  /**
   * 复制所有结果到剪贴板
   */
  const handleCopyAll = useCallback(async () => {
    const content = results
      .map((r, i) => `${i + 1}. ${r.data}`)
      .join('\n');
    
    await Clipboard.setStringAsync(content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('已复制', '所有扫码结果已复制到剪贴板，可直接粘贴到微信');
  }, [results, handleShareAll]);

  /**
   * 渲染单条结果
   */
  const renderItem = useCallback(
    ({ item, index }: { item: ScanResult; index: number }) => {
      const isUrlType = isUrl(item.data);
      const icon = isUrlType ? 'link' : 'text-fields';
      const iconColor = isUrlType ? '#4ECDC4' : '#FF6B6B';

      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePressItem(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemIndex}>
            <Text style={styles.itemIndexText}>{index + 1}</Text>
          </View>
          
          <View style={[styles.itemIcon, { backgroundColor: iconColor + '20' }]}>
            <MaterialIcons name={icon as any} size={24} color={iconColor} />
          </View>
          
          <View style={styles.itemContent}>
            <Text style={styles.itemText} numberOfLines={2} ellipsizeMode="middle">
              {item.data}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.itemType}>{getTypeName(item.type)}</Text>
              {isUrlType && (
                <Text style={styles.itemUrlTag}>可点击</Text>
              )}
            </View>
          </View>
          
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      );
    },
    [handlePressItem]
  );

  /**
   * 分隔线
   */
  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>批量扫描结果</Text>
          <Text style={styles.headerSubtitle}>{timestamp}</Text>
        </View>
        <TouchableOpacity onPress={handleShareAll} style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#00E5CC" />
        </TouchableOpacity>
      </View>

      {/* 统计栏 */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <MaterialIcons name="qr-code" size={20} color="#FFD700" />
          <Text style={styles.statText}>共 {results.length} 个码</Text>
        </View>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyAll}>
          <MaterialIcons name="content-copy" size={18} color="#00E5CC" />
          <Text style={styles.copyButtonText}>查看全部</Text>
        </TouchableOpacity>
      </View>

      {/* 结果列表 */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.data}-${index}`}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="qr-code-scanner" size={80} color="#333" />
            <Text style={styles.emptyTitle}>暂无扫描结果</Text>
          </View>
        }
      />

      {/* 底部操作栏 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push('/(tabs)/history')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="history" size={24} color="#fff" />
          <Text style={styles.footerButtonText}>查看历史</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="#000" />
          <Text style={styles.footerButtonTextPrimary}>继续扫码</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#B0B0B0',
    fontSize: 12,
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 229, 204, 0.15)',
    borderRadius: 16,
  },
  copyButtonText: {
    color: '#00E5CC',
    fontSize: 13,
  },
  listContent: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
  },
  itemIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIndexText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemType: {
    fontSize: 11,
    color: '#B0B0B0',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemUrlTag: {
    fontSize: 11,
    color: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#B0B0B0',
    fontSize: 16,
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2A2A3E',
    gap: 8,
  },
  footerButtonPrimary: {
    backgroundColor: '#00E5CC',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footerButtonTextPrimary: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
});