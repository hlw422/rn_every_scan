/**
 * ScanFrame 组件
 * 扫描框：四角边框 + 上下移动扫描线动画
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// 扫描框尺寸
const FRAME_SIZE = 300;
// 四角边框长度
const CORNER_LENGTH = 30;
// 四角边框宽度
const CORNER_WIDTH = 4;
// 扫描线颜色
const SCAN_COLOR = '#00E5CC';

interface ScanFrameProps {
  isScanning?: boolean;
}

export function ScanFrame({ isScanning = true }: ScanFrameProps) {
  // 扫描线位置动画值
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      // 扫描线从顶部到底部循环移动
      translateY.value = withRepeat(
        withSequence(
          withTiming(FRAME_SIZE - 4, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 0,
          })
        ),
        -1, // 无限循环
        false
      );
    } else {
      // 停止时重置位置
      translateY.value = withTiming(0, { duration: 200 });
    }
  }, [isScanning, translateY]);

  // 扫描线动画样式
  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* 四角边框 */}
      {/* 左上角 */}
      <View style={[styles.corner, styles.topLeft]}>
        <View style={[styles.cornerHorizontal, { backgroundColor: SCAN_COLOR }]} />
        <View style={[styles.cornerVertical, { backgroundColor: SCAN_COLOR }]} />
      </View>
      
      {/* 右上角 */}
      <View style={[styles.corner, styles.topRight]}>
        <View style={[styles.cornerHorizontal, { backgroundColor: SCAN_COLOR }]} />
        <View style={[styles.cornerVertical, { backgroundColor: SCAN_COLOR }]} />
      </View>
      
      {/* 左下角 */}
      <View style={[styles.corner, styles.bottomLeft]}>
        <View style={[styles.cornerHorizontal, { backgroundColor: SCAN_COLOR }]} />
        <View style={[styles.cornerVertical, { backgroundColor: SCAN_COLOR }]} />
      </View>
      
      {/* 右下角 */}
      <View style={[styles.corner, styles.bottomRight]}>
        <View style={[styles.cornerHorizontal, { backgroundColor: SCAN_COLOR }]} />
        <View style={[styles.cornerVertical, { backgroundColor: SCAN_COLOR }]} />
      </View>

      {/* 扫描线 */}
      {isScanning && (
        <Animated.View style={[styles.scanLine, scanLineStyle]}>
          <View style={styles.scanLineInner} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  // 四角容器
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  // 横向边框
  cornerHorizontal: {
    position: 'absolute',
    height: CORNER_WIDTH,
    width: CORNER_LENGTH,
    borderRadius: 2,
  },
  // 纵向边框
  cornerVertical: {
    position: 'absolute',
    width: CORNER_WIDTH,
    height: CORNER_LENGTH,
    borderRadius: 2,
  },
  // 左上角
  topLeft: {
    top: 0,
    left: 0,
  },
  // 右上角
  topRight: {
    top: 0,
    right: 0,
  },
  // 左下角
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  // 右下角
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  // 扫描线容器
  scanLine: {
    position: 'absolute',
    top: 2,
    left: 10,
    right: 10,
    height: 2,
  },
  // 扫描线（带发光效果）
  scanLineInner: {
    flex: 1,
    backgroundColor: SCAN_COLOR,
    shadowColor: SCAN_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
