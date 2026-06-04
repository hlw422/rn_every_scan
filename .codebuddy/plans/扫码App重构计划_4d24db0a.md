---
name: 扫码App重构计划
overview: 将现有 Expo 项目改造为生产级扫码 App：替换 tab 页面为扫码主界面+历史记录，集成 expo-camera、AsyncStorage、expo-haptics，实现全屏相机+扫描动画+Modal 结果展示。
design:
  architecture:
    framework: react
  styleKeywords:
    - 沉浸式暗黑
    - 青色高亮
    - 毛玻璃底栏
    - 扫描线动画
    - 底部弹出卡片
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 700
    subheading:
      size: 16px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#00E5CC"
      - "#00B8A9"
    background:
      - "#000000"
      - "#1A1A2E"
      - "#16213E"
    text:
      - "#FFFFFF"
      - "#B0B0B0"
    functional:
      - "#FF6B6B"
      - "#4ECDC4"
      - "#45B7D1"
todos:
  - id: install-deps
    content: 安装 expo-camera 和 @react-native-async-storage/async-storage 依赖
    status: completed
  - id: update-config
    content: 更新 app.json 添加相机权限配置，更新 IconSymbol 映射添加扫码相关图标
    status: completed
    dependencies:
      - install-deps
  - id: create-scan-history-hook
    content: 创建 useScanHistory hook 封装 AsyncStorage 历史记录 CRUD
    status: completed
    dependencies:
      - install-deps
  - id: create-scan-frame-component
    content: 创建 ScanFrame 组件实现四角边框 + 扫描线动画（reanimated）
    status: completed
  - id: create-scan-page
    content: 创建扫码主页面 app/(tabs)/index.tsx：CameraView、权限管理、torch 控制、防抖扫码
    status: completed
    dependencies:
      - install-deps
      - create-scan-frame-component
      - create-scan-history-hook
  - id: create-history-page
    content: 创建历史记录页 app/(tabs)/history.tsx：FlatList 展示、清空功能、空状态
    status: completed
    dependencies:
      - create-scan-history-hook
  - id: create-result-modal
    content: 创建扫码结果 Modal app/scan-result.tsx：URL 检测、复制、浏览器打开、再扫一次
    status: completed
    dependencies:
      - create-scan-history-hook
  - id: update-layout
    content: 更新路由布局：tab 配置、根布局注册 Modal、清理无用文件
    status: completed
    dependencies:
      - create-scan-page
      - create-history-page
      - create-result-modal
---

## Product Overview

生产级扫码 App，基于 Expo SDK 54 + expo-router 文件路由，替换现有 tab 页面为扫码主页面和历史记录页面，使用 Modal 路由展示扫码结果。

## Core Features

1. 权限管理：优雅请求相机权限，拒绝后展示引导提示
2. 核心扫码：使用 CameraView 的 onBarcodeScanned 扫码（QR Code + Barcode）
3. 闪光灯控制：一键切换 torch 持续照明模式，UI 状态反馈
4. 防抖拦截：扫码成功后立即暂停扫描，通过"再扫一次"按钮恢复
5. 触觉反馈：扫码成功触发 expo-haptics impactAsync
6. 结果智能处理：URL 提供"在浏览器中打开"按钮（expo-linking），纯文本提供"复制"按钮
7. 历史记录：AsyncStorage 自动存储扫码结果，支持查看和清空
8. UI/UX：沉浸式全屏相机、扫描框四角边框 + 上下移动扫描线动画、SafeAreaView 底部适配、Modal 结果弹出不跳转页面

## Tech Stack

- 框架：Expo SDK 54 (Managed Workflow) + expo-router ~6.0
- 核心库：expo-camera（CameraView + BarcodeScanning）、expo-haptics、expo-linking、@react-native-async-storage/async-storage
- 动画：react-native-reanimated ~4.1（已安装）
- 样式：React Native StyleSheet（原生性能）

## Tech Architecture

### 系统架构

基于 expo-router 文件路由的模块化架构：

```
expo-router 文件路由
├── app/_layout.tsx          (根布局，Stack + ThemeProvider)
├── app/(tabs)/_layout.tsx   (Tab 导航配置)
├── app/(tabs)/index.tsx     (扫码主页面 ← 替换 Home)
├── app/(tabs)/history.tsx   (历史记录页 ← 替换 Explore)
└── app/scan-result.tsx      (扫码结果 Modal)
```

### 模块划分

- **UI 层**：扫码页面、历史页面、结果 Modal、扫描框动画组件
- **业务逻辑层**：useScanHistory hook（AsyncStorage 封装）
- **工具层**：URL 检测工具、复制工具

### 数据流

扫码成功 → 触觉反馈 → 暂停扫描 → 路由跳转 Modal → 展示结果 → 操作（打开/复制） → 关闭 Modal → 存入 AsyncStorage → 手动恢复扫描

## Implementation Notes

### expo-camera SDK 54 避坑指南

1. **API 变更**：expo-camera 在 SDK 51+ 使用 `CameraView` 组件替代旧的 `Camera`，`onBarCodeScanned` 改为 `onBarcodeScanned`
2. **BarcodeScanning**：使用 `barcodeScannerSettings={{ barcodeTypes: [...] }}` 配置支持的条码类型
3. **torch 控制**：`enableTorch` 属性控制闪光灯，需在 state 中管理
4. **权限**：使用 `useCameraPermissions()` hook，返回 `[permission, requestPermission]`
5. **性能**：扫码成功后设置 `scanned` state 为 true，阻止 `onBarcodeScanned` 回调重复触发

### 历史记录存储方案

- key：`@scan_history`
- 格式：`{ id, data, type, timestamp }[]`
- 最大记录数：200 条（超出时 FIFO 淘汰）

### 扫码结果 Modal 设计

使用 expo-router 的 Stack.Screen `presentation: 'modal'`，通过 `router.push({ pathname: '/scan-result', params: { data, type } })` 传递数据

## Design Style

采用沉浸式暗黑风格，与相机取景器自然融合。扫码区域中央放置带四角高亮边框的扫描框，配合青色扫描线上下移动动画。底部操作区使用半透明毛玻璃底栏。结果 Modal 采用底部弹出式卡片，圆角设计，暗色背景。

### 页面规划（3 个页面）

#### 1. 扫码主页面 (ScanPage)

- **全屏相机区**：CameraView 占满全屏，沉浸式无顶栏
- **扫描框覆盖层**：中央 250x250 扫描框，四角青色边框（8px 宽，30px 长），中心区域透明，外围半透明黑色遮罩
- **扫描线动画**：青色水平线在扫描框内上下循环移动（reanimated）
- **底部控制栏**：SafeAreaView 内，左侧闪光灯按钮（torch 图标 + 状态切换），右侧历史记录入口
- **权限拒绝提示**：全屏居中，带引导文案和"去设置"按钮

#### 2. 历史记录页 (HistoryPage)

- **顶部标题栏**：标题"扫码历史"，右侧"清空"按钮
- **列表区**：FlatList 展示历史记录，每项显示：图标（URL/文本）、扫码内容（截断显示）、时间
- **空状态**：无记录时显示空状态插画和提示文案
- **点击交互**：点击记录跳转至结果 Modal

#### 3. 扫码结果 Modal (ScanResultModal)

- **底部弹出卡片**：圆角 16px，暗色背景
- **内容区**：扫码类型标签（QR Code / Barcode）、扫码内容全文展示
- **操作区**：URL 时显示"在浏览器中打开"按钮，纯文本时显示"复制"按钮，底部"再扫一次"和"关闭"按钮