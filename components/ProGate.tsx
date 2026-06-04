/**
 * ProGate 组件
 * Pro 功能锁定门控，点击弹出升级提示
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
  isLocked?: boolean;
}

export function ProGate({ feature, children, isLocked = true }: ProGateProps) {
  const router = useRouter();

  const handlePress = () => {
    Alert.alert(
      'Pro 专属功能',
      `${feature} 是 Pro 会员专属功能，升级后即可解锁全部高级功能。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '查看详情',
          onPress: () => router.push('/premium'),
        },
      ]
    );
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.overlay}>
        <View style={styles.lockIcon}>
          <MaterialIcons name="lock" size={24} color="#FFD700" />
        </View>
        <Text style={styles.text}>Pro 专属</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
  },
  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
});
