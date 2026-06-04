/**
 * 扫码主页面
 * 全屏相机 + 扫描框动画 + 权限管理 + torch 控制
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanFrame } from '@/components/ScanFrame';
import { useScanHistory } from '@/hooks/useScanHistory';
import { usePremium } from '@/hooks/usePremium';

// 存储 Key
const BATCH_MODE_KEY = '@batch_mode_enabled';

// 条码类型配置
const BARCODE_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'codabar',
  'itf14',
  'aztec',
  'datamatrix',
  'pdf417',
];

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { isPro } = usePremium();
  const { addRecord } = useScanHistory(isPro);

  // 扫描状态
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<Map<string, { data: string; type: string }>>(new Map());
  
  // 批量扫描使用 ref 避免异步延迟
  const batchResultsRef = useRef<Map<string, { data: string; type: string }>>(new Map());
  const isBatchScanningRef = useRef(false);

  /**
   * 保存批量扫码状态
   */
  const saveBatchMode = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(BATCH_MODE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('保存批量扫码状态失败:', error);
    }
  }, []);

  /**
   * 加载批量扫码状态
   */
  const loadBatchMode = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(BATCH_MODE_KEY);
      if (value !== null) {
        const enabled = JSON.parse(value) as boolean;
        setBatchMode(enabled);
        isBatchScanningRef.current = enabled;
      }
    } catch (error) {
      console.error('加载批量扫码状态失败:', error);
    }
  }, []);

  /**
   * 请求相机权限
   */
  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        '需要相机权限',
        '请在系统设置中允许访问相机，以便扫描二维码和条形码',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => Linking.openSettings() },
        ]
      );
    }
  }, [requestPermission]);

  /**
   * 扫码成功回调
   */
  const handleBarCodeScanned = useCallback(
    ({ data, type }: { data: string; type: string }) => {
      // 批量扫码模式：快速收集结果
      if (batchMode && isPro && isBatchScanningRef.current) {
        // 使用 ref 同步更新，避免异步延迟
        if (!batchResultsRef.current.has(data)) {
          batchResultsRef.current.set(data, { data, type });
          // 异步更新 UI 显示（不阻塞扫描）
          setBatchResults(new Map(batchResultsRef.current));
          // 轻量触觉反馈（不等待完成）
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return; // 不暂停扫描，继续检测
      }
      
      // 单次扫码模式
      if (scanned) return;
      setScanned(true);
      
      // 触觉反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 保存并跳转
      addRecord(data, type).then(() => {
        router.push({
          pathname: '/scan-result',
          params: { data, type },
        });
      });
    },
    [scanned, addRecord, router, batchMode, isPro]
  );

  /**
   * 初始化加载保存的状态
   */
  useFocusEffect(
    useCallback(() => {
      loadBatchMode();
    }, [loadBatchMode])
  );

  /**
   * 切换闪光灯
   */
  const toggleTorch = useCallback(() => {
    setTorchEnabled(prev => !prev);
  }, []);

  /**
   * 完成批量扫描，跳转结果页面
   */
  const handleBatchComplete = useCallback(async () => {
    if (batchResultsRef.current.size === 0) {
      Alert.alert('提示', '还未扫描到任何二维码');
      return;
    }

    // 立即暂停所有扫描（防止继续触发扫码回调）
    setScanned(true);
    isBatchScanningRef.current = false;

    // 批量保存到历史记录
    const resultsArray = Array.from(batchResultsRef.current.values());
    for (const result of resultsArray) {
      await addRecord(result.data, result.type);
    }

    // 跳转到批量结果页面
    router.push({
      pathname: '/batch-result',
      params: { results: JSON.stringify(resultsArray) },
    });

    // 重置批量模式
    setBatchMode(false);
    setBatchResults(new Map());
    batchResultsRef.current = new Map();
  }, [addRecord, router]);

  /**
   * 退出批量模式
   */
  const handleExitBatch = useCallback(() => {
    isBatchScanningRef.current = false;
    setBatchMode(false);
    setBatchResults(new Map());
    batchResultsRef.current = new Map();
    setScanned(false);
    saveBatchMode(false);
  }, [saveBatchMode]);

  /**
   * 当页面重新获得焦点时（从 Modal 返回），自动重置扫码状态
   */
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setBatchResults(new Map());
    }, [])
  );

  // 未授权状态
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>正在请求相机权限...</Text>
      </View>
    );
  }

  // 权限被拒绝状态
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="no-photography" size={80} color="#666" />
        <Text style={styles.permissionTitle}>需要相机权限</Text>
        <Text style={styles.permissionDesc}>
          扫码功能需要使用相机，请授予相机访问权限
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Text style={styles.permissionButtonText}>授予权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 沉浸式状态栏 */}
      <StatusBar style="light" />
      
      {/* 相机预览 */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: BARCODE_TYPES,
        }}
        onBarcodeScanned={
          scanned 
            ? undefined  // 已暂停，不触发任何扫码
            : (batchMode && isPro && isBatchScanningRef.current)
              ? handleBarCodeScanned  // 批量模式持续扫描
              : handleBarCodeScanned  // 单次模式
        }
      />
      
      {/* 遮罩层 */}
      <View style={styles.overlay}>
        {/* 顶部遮罩 */}
        <View style={[styles.overlayTop, { paddingTop: insets.top + 20 }]} />
        
        {/* 中间区域：扫描框 */}
        <View style={styles.overlayMiddle}>
          {/* 左侧遮罩 */}
          <View style={styles.overlaySide} />
          
          {/* 扫描框 */}
          <View style={styles.scanFrameContainer}>
            <ScanFrame isScanning={!scanned} />
          </View>
          
          {/* 右侧遮罩 */}
          <View style={styles.overlaySide} />
        </View>
        
        {/* 底部遮罩 */}
        <View style={styles.overlayBottom}>
          {batchMode && isPro ? (
            <View style={styles.batchInfo}>
              <Text style={styles.batchCount}>{batchResults.size}</Text>
              <Text style={styles.batchLabel}>已识别（去重）</Text>
              <TouchableOpacity
                style={styles.batchCompleteButton}
                onPress={handleBatchComplete}
                activeOpacity={0.7}
              >
                <MaterialIcons name="check-circle" size={20} color="#000" />
                <Text style={styles.batchCompleteButtonText}>完成扫描</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.hintText}>
              {scanned ? '扫码成功！' : '将二维码/条形码放入框内自动扫描'}
            </Text>
          )}
        </View>
      </View>
      
      {/* 底部控制栏 */}
      <View style={[styles.controlBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* 闪光灯按钮 */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleTorch}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={torchEnabled ? 'flash-on' : 'flash-off'}
            size={28}
            color="#fff"
          />
          <Text style={styles.controlButtonText}>
            {torchEnabled ? '关闭闪光灯' : '开启闪光灯'}
          </Text>
        </TouchableOpacity>
        
        {/* 批量扫码按钮 */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (!isPro) {
              Alert.alert('Pro 专属功能', '批量扫码需要升级到 Pro 会员', [
                { text: '取消', style: 'cancel' },
                { text: '查看详情', onPress: () => router.push('/premium') },
              ]);
              return;
            }
            if (batchMode) {
              handleExitBatch();
              saveBatchMode(false);
            } else {
              // 进入批量模式
              setBatchMode(true);
              isBatchScanningRef.current = true;
              batchResultsRef.current = new Map();
              setBatchResults(new Map());
              saveBatchMode(true);
              setScanned(false);
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={batchMode ? 'layers-clear' : 'layers'}
            size={28}
            color={batchMode ? '#FFD700' : isPro ? '#fff' : '#666'}
          />
          <Text style={[styles.controlButtonText, batchMode && styles.controlButtonTextActive, !isPro && styles.controlButtonTextDisabled]}>
            {batchMode ? '退出批量' : '批量扫码'}
          </Text>
          {!isPro && !batchMode && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* 历史记录按钮 */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => router.push('/(tabs)/history')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="history" size={28} color="#fff" />
          <Text style={styles.controlButtonText}>历史记录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // 权限相关样式
  permissionContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  permissionButton: {
    backgroundColor: '#00E5CC',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // 遮罩层
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 300,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrameContainer: {
    width: 300,
    height: 300,
  },
  overlayBottom: {
    flex: 1.3, // 稍微大一点，为底部控制栏留出空间
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    paddingTop: 20,
  },
  hintText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  batchInfo: {
    alignItems: 'center',
  },
  batchCount: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: '700',
  },
  batchLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    marginTop: 4,
  },
  batchCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E5CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  batchCompleteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  // 底部控制栏
  controlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 16,
    paddingHorizontal: 32,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  controlButtonTextActive: {
    color: '#FFD700',
  },
  controlButtonTextDisabled: {
    color: '#666',
  },
  proBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
});
