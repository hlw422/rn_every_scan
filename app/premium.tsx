/**
 * Pro 升级页面
 * 功能对比、价格展示、购买入口
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePremium } from '@/hooks/usePremium';
import { FEATURE_INFO, PRICING, PremiumFeature } from '@/constants/premium';

const { width } = Dimensions.get('window');

export default function PremiumScreen() {
  const router = useRouter();
  const { isPro, activatePro } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  const handlePurchase = async () => {
    Alert.alert(
      '确认购买',
      `您选择了 ${selectedPlan === 'monthly' ? '月度' : selectedPlan === 'yearly' ? '年度' : '永久'} Pro 会员`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            // 模拟购买成功
            const success = await activatePro(selectedPlan);
            if (success) {
              Alert.alert('购买成功', '您已成功升级为 Pro 会员！', [
                { text: '好的', onPress: () => router.back() },
              ]);
            }
          },
        },
      ]
    );
  };

  const features = Object.values(PremiumFeature);

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>升级 Pro</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero 区域 */}
        <View style={styles.hero}>
          <View style={styles.crownContainer}>
            <MaterialIcons name="workspace-premium" size={64} color="#FFD700" />
          </View>
          <Text style={styles.heroTitle}>解锁全部功能</Text>
          <Text style={styles.heroSubtitle}>
            升级 Pro 会员，享受无限制的扫码体验
          </Text>
        </View>

        {/* 功能列表 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pro 专属功能</Text>
          {features.map((feature) => {
            const info = FEATURE_INFO[feature];
            return (
              <View key={feature} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialIcons
                    name={info.icon as any}
                    size={24}
                    color="#FFD700"
                  />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{info.title}</Text>
                  <Text style={styles.featureDesc}>{info.description}</Text>
                </View>
                <MaterialIcons name="check-circle" size={20} color="#00E5CC" />
              </View>
            );
          })}
        </View>

        {/* 价格选择 */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>选择套餐</Text>
          
          {/* 月度 */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planInfo}>
              <Text style={styles.planName}>月度会员</Text>
              <Text style={styles.planPrice}>¥{PRICING.MONTHLY.price}/{PRICING.MONTHLY.period}</Text>
            </View>
            <View style={[
              styles.radio,
              selectedPlan === 'monthly' && styles.radioSelected,
            ]} />
          </TouchableOpacity>

          {/* 年度 */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{PRICING.YEARLY.badge}</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>年度会员</Text>
              <Text style={styles.planPrice}>¥{PRICING.YEARLY.price}/{PRICING.YEARLY.period}</Text>
            </View>
            <View style={[
              styles.radio,
              selectedPlan === 'yearly' && styles.radioSelected,
            ]} />
          </TouchableOpacity>

          {/* 永久 */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'lifetime' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('lifetime')}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{PRICING.LIFETIME.badge}</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>永久会员</Text>
              <Text style={styles.planPrice}>¥{PRICING.LIFETIME.price}/{PRICING.LIFETIME.period}</Text>
            </View>
            <View style={[
              styles.radio,
              selectedPlan === 'lifetime' && styles.radioSelected,
            ]} />
          </TouchableOpacity>
        </View>

        {/* 底部留白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 购买按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseButton, isPro && styles.purchaseButtonDisabled]}
          onPress={isPro ? undefined : handlePurchase}
          disabled={isPro}
        >
          <Text style={styles.purchaseButtonText}>
            {isPro ? '已是 Pro 会员' : '立即升级'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          购买即表示同意《用户协议》和《隐私政策》
        </Text>
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planPrice: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '700',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B0B0B0',
  },
  radioSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#FFD700',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
  },
  purchaseButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#666',
  },
  purchaseButtonText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  termsText: {
    color: '#B0B0B0',
    fontSize: 12,
    textAlign: 'center',
  },
});
