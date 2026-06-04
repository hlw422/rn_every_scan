/**
 * Pro 会员功能配置
 */

// 功能标识
export enum PremiumFeature {
  UNLIMITED_HISTORY = 'unlimited_history',
  BATCH_SCAN = 'batch_scan',
  QR_GENERATE = 'qr_generate',
  DATA_EXPORT = 'data_export',
  ADVANCED_STATS = 'advanced_stats',
  AD_FREE = 'ad_free',
}

// 功能描述
export const FEATURE_INFO: Record<PremiumFeature, {
  icon: string;
  title: string;
  description: string;
}> = {
  [PremiumFeature.UNLIMITED_HISTORY]: {
    icon: 'infinity',
    title: '无限历史记录',
    description: '突破 200 条限制，保存所有扫码记录',
  },
  [PremiumFeature.BATCH_SCAN]: {
    icon: 'layers',
    title: '连续扫码模式',
    description: '批量扫描多个码，无需反复操作',
  },
  [PremiumFeature.QR_GENERATE]: {
    icon: 'qrcode',
    title: '二维码生成器',
    description: '将文本、URL、WiFi 等转换为二维码',
  },
  [PremiumFeature.DATA_EXPORT]: {
    icon: 'download',
    title: '数据导出',
    description: '导出扫码历史为 CSV 文件',
  },
  [PremiumFeature.ADVANCED_STATS]: {
    icon: 'bar-chart',
    title: '高级统计分析',
    description: '扫码频率、类型分布、趋势图表',
  },
  [PremiumFeature.AD_FREE]: {
    icon: 'shield-off',
    title: '无广告体验',
    description: '纯净使用，无任何广告干扰',
  },
};

// 免费版限制
export const FREE_LIMITS = {
  MAX_HISTORY: 200,
  DAILY_SCANS: 50,
};

// Pro 价格配置（示例）
export const PRICING = {
  MONTHLY: { price: 12, period: '月' },
  YEARLY: { price: 98, period: '年', badge: '省 32%' },
  LIFETIME: { price: 198, period: '永久', badge: '最划算' },
};

// 存储 Key
export const PREMIUM_STORAGE_KEY = '@premium_status';
