/**
 * 扫码结果 Modal
 * 展示扫码结果，支持复制文本、打开链接、再扫一次
 */
import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isUrl } from '@/hooks/useScanHistory';

export default function ScanResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, type } = useLocalSearchParams<{ data: string; type: string }>();

  // 判断是否为 URL
  const isUrlType = useMemo(() => data ? isUrl(data) : false, [data]);

  /**
   * 复制到剪贴板
   */
  const handleCopy = useCallback(async () => {
    if (!data) return;
    
    await Clipboard.setStringAsync(data);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('已复制', '内容已复制到剪贴板');
  }, [data]);

  /**
   * 在浏览器中打开
   */
  const handleOpenLink = useCallback(async () => {
    if (!data) return;
    
    try {
      const canOpen = await Linking.canOpenURL(data);
      if (canOpen) {
        await Linking.openURL(data);
      } else {
        Alert.alert('无法打开', '无法打开此链接');
      }
    } catch (error) {
      Alert.alert('错误', '打开链接时出错');
    }
  }, [data]);

  /**
   * 再扫一次
   */
  const handleScanAgain = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * 关闭 Modal
   */
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (!data) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.errorText}>无扫码数据</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* 拖拽指示器 */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      
      {/* 内容区 */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 类型标签 */}
        <View style={styles.typeContainer}>
          <View style={[
            styles.typeBadge,
            { backgroundColor: isUrlType ? '#4ECDC420' : '#FF6B6B20' }
          ]}>
            <MaterialIcons
              name={isUrlType ? 'link' : 'text-fields'}
              size={16}
              color={isUrlType ? '#4ECDC4' : '#FF6B6B'}
            />
            <Text style={[
              styles.typeText,
              { color: isUrlType ? '#4ECDC4' : '#FF6B6B' }
            ]}>
              {isUrlType ? 'URL 链接' : '文本内容'}
            </Text>
          </View>
          
          {type && (
            <View style={styles.barcodeTypeBadge}>
              <Text style={styles.barcodeTypeText}>{type}</Text>
            </View>
          )}
        </View>
        
        {/* 扫码内容 */}
        <View style={styles.dataContainer}>
          <Text style={styles.dataText} selectable>
            {data}
          </Text>
        </View>
      </ScrollView>
      
      {/* 操作按钮区 */}
      <View style={styles.actions}>
        {/* 主操作按钮 */}
        {isUrlType ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleOpenLink}
            activeOpacity={0.8}
          >
            <MaterialIcons name="open-in-browser" size={24} color="#000" />
            <Text style={styles.primaryButtonText}>在浏览器中打开</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <MaterialIcons name="content-copy" size={24} color="#000" />
            <Text style={styles.primaryButtonText}>复制内容</Text>
          </TouchableOpacity>
        )}
        
        {/* 次要操作按钮 */}
        <View style={styles.secondaryActions}>
          {/* 复制按钮（URL 时也显示） */}
          {isUrlType && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <MaterialIcons name="content-copy" size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>复制链接</Text>
            </TouchableOpacity>
          )}
          
          {/* 再扫一次 */}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleScanAgain}
            activeOpacity={0.7}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>再扫一次</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  // 拖拽指示器
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
  // 滚动区域
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  // 类型标签
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  barcodeTypeBadge: {
    backgroundColor: '#2A2A3E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  barcodeTypeText: {
    fontSize: 12,
    color: '#888',
  },
  // 数据内容
  dataContainer: {
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 16,
  },
  dataText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  // 操作按钮区
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#00E5CC',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#2A2A3E',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  // 错误状态
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#2A2A3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});
