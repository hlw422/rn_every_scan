/**
 * 二维码生成页面
 * 支持文本、URL、WiFi 等类型
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QRGenerator } from '@/components/QRGenerator';
import { ProGate } from '@/components/ProGate';
import { usePremium } from '@/hooks/usePremium';

// 生成类型
type GenerateType = 'text' | 'url' | 'wifi';

export default function GenerateScreen() {
  const { isPro } = usePremium();
  const [type, setType] = useState<GenerateType>('text');
  const [inputValue, setInputValue] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiHidden, setWifiHidden] = useState(false);

  // 生成二维码值
  const getQRValue = (): string => {
    switch (type) {
      case 'text':
        return inputValue;
      case 'url':
        return inputValue.startsWith('http') ? inputValue : `https://${inputValue}`;
      case 'wifi':
        return `WIFI:T:WPA;S:${wifiSSID};P:${wifiPassword};H:${wifiHidden};;`;
      default:
        return inputValue;
    }
  };

  // 类型选项
  const typeOptions: { key: GenerateType; icon: string; label: string }[] = [
    { key: 'text', icon: 'text-fields', label: '文本' },
    { key: 'url', icon: 'link', label: '网址' },
    { key: 'wifi', icon: 'wifi', label: 'WiFi' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>生成二维码</Text>
        <Text style={styles.headerSubtitle}>将内容转换为二维码</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 类型选择 */}
        <ProGate feature="二维码生成器" isLocked={!isPro}>
          <View style={styles.typeSelector}>
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.typeButton,
                  type === option.key && styles.typeButtonActive,
                ]}
                onPress={() => setType(option.key)}
              >
                <MaterialIcons
                  name={option.icon as any}
                  size={20}
                  color={type === option.key ? '#00E5CC' : '#B0B0B0'}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    type === option.key && styles.typeLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ProGate>

        {/* 输入区域 */}
        <ProGate feature="二维码生成器" isLocked={!isPro}>
          <View style={styles.inputSection}>
            {type === 'text' && (
              <TextInput
                style={styles.input}
                placeholder="输入文本内容..."
                placeholderTextColor="#666"
                value={inputValue}
                onChangeText={setInputValue}
                multiline
                maxLength={500}
              />
            )}

            {type === 'url' && (
              <TextInput
                style={styles.input}
                placeholder="输入网址，例如 example.com"
                placeholderTextColor="#666"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}

            {type === 'wifi' && (
              <View style={styles.wifiInputs}>
                <TextInput
                  style={styles.input}
                  placeholder="WiFi 名称 (SSID)"
                  placeholderTextColor="#666"
                  value={wifiSSID}
                  onChangeText={setWifiSSID}
                />
                <TextInput
                  style={styles.input}
                  placeholder="WiFi 密码"
                  placeholderTextColor="#666"
                  value={wifiPassword}
                  onChangeText={setWifiPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setWifiHidden(!wifiHidden)}
                >
                  <MaterialIcons
                    name={wifiHidden ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={wifiHidden ? '#00E5CC' : '#B0B0B0'}
                  />
                  <Text style={styles.checkboxLabel}>隐藏网络</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ProGate>

        {/* 二维码预览 */}
        <View style={styles.previewSection}>
          <QRGenerator value={getQRValue()} size={220} />
        </View>

        {/* 底部留白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0, 229, 204, 0.15)',
    borderWidth: 1,
    borderColor: '#00E5CC',
  },
  typeLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: '#00E5CC',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    minHeight: 56,
  },
  wifiInputs: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  checkboxLabel: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  bottomSpacer: {
    height: 100,
  },
});
