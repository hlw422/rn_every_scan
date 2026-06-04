/**
 * QRGenerator 组件
 * 二维码生成器
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface QRGeneratorProps {
  value: string;
  size?: number;
}

export function QRGenerator({ value, size = 200 }: QRGeneratorProps) {
  const qrRef = useRef<any>(null);

  const handleSave = async () => {
    if (!qrRef.current) return;

    try {
      // 请求相册权限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能保存二维码');
        return;
      }

      // 生成图片
      qrRef.current.toDataURL(async (data: string) => {
        const fileUri = `${FileSystem.cacheDirectory}qrcode_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 保存到相册
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('EveryScan', asset, false);

        Alert.alert('保存成功', '二维码已保存到相册');
      });
    } catch (error) {
      console.error('保存二维码失败:', error);
      Alert.alert('保存失败', '无法保存二维码，请重试');
    }
  };

  const handleShare = async () => {
    if (!qrRef.current) return;

    try {
      // 生成图片
      qrRef.current.toDataURL(async (data: string) => {
        const fileUri = `${FileSystem.cacheDirectory}qrcode_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 分享
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: '分享二维码',
          });
        } else {
          Alert.alert('分享不可用', '当前设备不支持分享功能');
        }
      });
    } catch (error) {
      console.error('分享二维码失败:', error);
      Alert.alert('分享失败', '无法分享二维码，请重试');
    }
  };

  if (!value) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="qrcode" size={64} color="#3A3A4E" />
        <Text style={styles.emptyText}>输入内容生成二维码</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <QRCode
          ref={qrRef}
          value={value}
          size={size}
          backgroundColor="#FFFFFF"
          color="#1A1A2E"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <MaterialIcons name="save-alt" size={24} color="#00E5CC" />
          <Text style={styles.actionText}>保存到相册</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <MaterialIcons name="share" size={24} color="#FFD700" />
          <Text style={styles.actionText}>分享</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#B0B0B0',
    fontSize: 16,
    marginTop: 16,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    color: '#B0B0B0',
    fontSize: 14,
    marginTop: 8,
  },
});
