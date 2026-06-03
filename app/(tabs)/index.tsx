/**
 * 扫码主页面
 * 全屏相机 + 扫描框动画 + 权限管理 + torch 控制
 */
import React, { useState, useCallback } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanFrame } from '@/components/ScanFrame';
import { useScanHistory } from '@/hooks/useScanHistory';

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
  const { addRecord } = useScanHistory();

  // 扫描状态
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);

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
    async ({ data, type }: { data: string; type: string }) => {
      if (scanned) return;
      
      // 立即暂停扫描
      setScanned(true);
      
      // 触觉反馈
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 保存到历史记录
      await addRecord(data, type);
      
      // 跳转到结果 Modal
      router.push({
        pathname: '/scan-result',
        params: { data, type },
      });
    },
    [scanned, addRecord, router]
  );

  /**
   * 切换闪光灯
   */
  const toggleTorch = useCallback(() => {
    setTorchEnabled(prev => !prev);
  }, []);

  /**
   * 当页面重新获得焦点时（从 Modal 返回），自动重置扫码状态
   */
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
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
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
          <Text style={styles.hintText}>
            {scanned ? '扫码成功！' : '将二维码/条形码放入框内自动扫描'}
          </Text>
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
});
