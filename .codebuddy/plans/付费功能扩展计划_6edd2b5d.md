---
name: 付费功能扩展计划
overview: 为扫码应用添加吸引人的付费功能，包括批量扫码、二维码生成、数据导出、云端同步等高级功能
design:
  architecture:
    framework: react
  styleKeywords:
    - 深色主题
    - 金色点缀
    - 卡片式布局
    - 渐变按钮
  fontSystem:
    fontFamily: system-ui
    heading:
      size: "24"
      weight: 700
    subheading:
      size: "18"
      weight: 600
    body:
      size: "16"
      weight: 400
  colorSystem:
    primary:
      - "#00E5CC"
      - "#FFD700"
    background:
      - "#1A1A2E"
      - "#2A2A3E"
    text:
      - "#FFFFFF"
      - "#B0B0B0"
    functional:
      - "#4ECDC4"
      - "#FF6B6B"
todos:
  - id: "1"
    content: 安装新依赖：react-native-qrcode-svg、expo-media-library、expo-sharing、expo-file-system
    status: completed
  - id: "2"
    content: 创建会员系统：hooks/usePremium.ts + constants/premium.ts + components/ProGate.tsx
    status: completed
    dependencies:
      - "1"
  - id: "3"
    content: 创建 Pro 升级页面 app/premium.tsx（功能对比、价格、购买）
    status: completed
    dependencies:
      - "2"
  - id: "4"
    content: 修改 hooks/useScanHistory.ts，Pro 用户移除 200 条上限
    status: completed
    dependencies:
      - "2"
  - id: "5"
    content: 创建扫码统计模块：hooks/useScanStats.ts + app/(tabs)/stats.tsx + components/StatCard.tsx
    status: completed
    dependencies:
      - "2"
  - id: "6"
    content: 创建二维码生成器：components/QRGenerator.tsx + app/(tabs)/generate.tsx
    status: completed
    dependencies:
      - "2"
  - id: "7"
    content: 改造扫码主页面 app/(tabs)/index.tsx，增加连续扫码模式（Pro）
    status: completed
    dependencies:
      - "2"
  - id: "8"
    content: 改造历史页面 app/(tabs)/history.tsx，增加导出 CSV 功能和额度提示
    status: completed
    dependencies:
      - "4"
      - "2"
  - id: "9"
    content: 修改 Tab 布局 app/(tabs)/_layout.tsx 和根布局 app/_layout.tsx，注册新页面
    status: completed
    dependencies:
      - "3"
      - "5"
      - "6"
---

## 产品概述

为现有扫码 App 增加付费高级功能（Pro），通过提供差异化功能吸引用户付费解锁。

## 核心功能

### 1. 会员体系

- 本地会员状态管理（AsyncStorage 存储，后续可对接真实 IAP）
- 免费版展示功能锁定提示，引导升级
- Pro 升级页面（功能对比、价格展示、购买按钮）

### 2. 二维码生成器（Pro）

- 支持文本、URL、WiFi、名片等类型生成二维码
- 生成后可保存到相册、分享
- 新增底部 Tab 入口

### 3. 连续扫码模式（Pro）

- 扫码后不弹 Modal，自动继续扫描
- 扫码结果实时添加到列表中
- 适合批量盘点场景

### 4. 数据导出（Pro）

- 将扫码历史导出为 CSV 文件
- 支持分享到其他应用

### 5. 无限历史记录（Pro）

- 免费版限制 200 条，Pro 版无限制
- 历史页面显示当前额度提示

### 6. 扫码统计（Pro）

- 新增统计 Tab
- 展示：总扫码数、今日扫码、码制分布、扫码趋势图

## 技术栈

- 现有：Expo SDK 54、expo-router、AsyncStorage、react-native-reanimated
- 新增依赖：
- `react-native-qrcode-svg` — 二维码生成
- `expo-media-library` — 保存图片到相册
- `expo-sharing` — 系统分享
- `expo-file-system` — 文件写入（CSV 导出）

## 实现方案

### 会员状态管理

- `hooks/usePremium.ts`：自定义 Hook，管理 Pro 状态（AsyncStorage 持久化）
- `constants/premium.ts`：Pro 功能定义和配置
- `components/ProGate.tsx`：Pro 功能锁定门控组件，点击弹出升级提示

### 架构设计

```
hooks/
├── usePremium.ts        # [NEW] 会员状态管理
├── useScanHistory.ts    # [MODIFY] 移除 200 条上限限制（Pro）
└── useScanStats.ts      # [NEW] 扫码统计计算

components/
├── ProGate.tsx          # [NEW] Pro 功能锁定门控
├── QRGenerator.tsx      # [NEW] 二维码生成器组件
├── BatchScanOverlay.tsx # [NEW] 连续扫码结果浮层
└── StatCard.tsx         # [NEW] 统计卡片组件

app/
├── premium.tsx          # [NEW] Pro 升级页面（Modal）
├── (tabs)/
│   ├── _layout.tsx      # [MODIFY] 新增"生成"和"统计"Tab
│   ├── index.tsx        # [MODIFY] 连续扫码模式支持
│   ├── history.tsx      # [MODIFY] 导出按钮、额度提示
│   ├── generate.tsx     # [NEW] 二维码生成页
│   └── stats.tsx        # [NEW] 扫码统计页
```

### 依赖安装

```
npx expo install react-native-qrcode-svg expo-media-library expo-sharing expo-file-system
```

## 设计风格

延续现有深色主题（#1A1A2E 背景 + #00E5CC 主色），为 Pro 功能增加金色（#FFD700）作为高级标识色。

- Pro 升级页面：功能对比卡片、渐变按钮、粒子动画背景
- 统计页面：深色卡片 + 彩色图表 + 数字动画
- 二维码生成页：白色二维码区域 + 深色操作栏
- 连续扫码：底部浮窗实时展示已扫条目数量