# 📱 RN Every Scan

一个基于 Expo + React Native 开发的生产级扫码应用，支持 QR Code 和多种常见条形码格式。

## ✨ 功能特性

### 🔍 核心扫码
- 支持 QR Code、EAN-13、EAN-8、UPC-A、UPC-E、Code 128、Code 39、Code 93、Codabar、ITF-14、Aztec、DataMatrix、PDF417 等多种码制
- 全屏沉浸式相机预览
- 智能识别内容类型（URL / 纯文本）

### 🎯 交互体验
- **扫描动画**：四角边框 + 上下移动的扫描线动画（react-native-reanimated）
- **触觉反馈**：扫码成功时触发震动反馈（expo-haptics）
- **防抖机制**：扫码后自动暂停，防止重复触发
- **闪光灯控制**：一键切换手电筒模式

### 📋 结果处理
- **URL 链接**：检测到 URL 时提供"在浏览器中打开"按钮
- **纯文本**：提供"复制内容"按钮
- **再扫一次**：快速返回继续扫描

### 📜 历史记录
- 自动保存扫码结果到本地存储
- 支持查看历史记录列表
- 支持清空历史记录
- 最大存储 200 条记录，FIFO 淘汰机制

### 🎨 UI/UX 设计
- 深色主题，护眼舒适
- 沉浸式全屏相机
- 底部安全区适配（SafeAreaView）
- Modal 弹窗展示扫码结果

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Expo | ~54.0.34 | 开发框架 |
| React | 19.1.0 | UI 库 |
| React Native | 0.81.5 | 移动端框架 |
| expo-router | ~6.0.23 | 文件路由 |
| expo-camera | ~17.0.10 | 相机和扫码 |
| expo-haptics | ~15.0.8 | 触觉反馈 |
| expo-clipboard | ~8.0.8 | 剪贴板操作 |
| expo-linking | ~8.0.12 | 深度链接 |
| react-native-reanimated | ~4.1.1 | 动画引擎 |
| @react-native-async-storage/async-storage | 2.2.0 | 本地存储 |

## 📁 项目结构

```
rn_every_scan/
├── app/                          # 路由页面
│   ├── _layout.tsx               # 根布局（主题配置）
│   ├── scan-result.tsx           # 扫码结果 Modal
│   └── (tabs)/                   # Tab 导航
│       ├── _layout.tsx           # Tab 配置
│       ├── index.tsx             # 扫码主页面
│       └── history.tsx           # 历史记录页面
├── components/
│   └── ScanFrame.tsx             # 扫描框动画组件
├── hooks/
│   ├── useScanHistory.ts         # 历史记录 CRUD Hook
│   └── use-color-scheme.ts       # 主题 Hook
├── constants/
│   └── theme.ts                  # 主题常量
├── assets/                       # 静态资源
│   ├── images/                   # 图片资源
│   └── fonts/                    # 字体文件
├── app.json                      # Expo 配置
├── package.json                  # 依赖管理
└── tsconfig.json                 # TypeScript 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn
- Expo CLI
- Android Studio（Android 开发）或 Xcode（iOS 开发）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/hlw422/rn_every_scan.git
   cd rn_every_scan
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npx expo start
   ```

4. **运行应用**

   - **Android**：按 `a` 键或运行 `npx expo start --android`
   - **iOS**：按 `i` 键或运行 `npx expo start --ios`
   - **Expo Go**：扫描终端中的二维码

## 📖 使用说明

### 扫码操作

1. 打开应用，默认进入扫码页面
2. 授予相机权限（首次使用时会请求）
3. 将二维码/条形码放入扫描框内
4. 扫码成功后会震动提示并弹出结果

### 闪光灯控制

- 点击底部"开启闪光灯"按钮
- 再次点击关闭闪光灯

### 查看历史

- 点击底部"历史记录"按钮
- 查看所有扫码记录
- 点击"清空历史"删除所有记录

### 结果处理

- **URL 链接**：点击"在浏览器中打开"
- **纯文本**：点击"复制内容"
- **再扫一次**：点击返回扫码页面继续扫描

## 🔧 核心实现

### 权限管理

```typescript
const [permission, requestPermission] = useCameraPermissions();

// 请求权限
const result = await requestPermission();
if (!result.granted) {
  Alert.alert('需要相机权限', '请在系统设置中允许访问相机', [
    { text: '去设置', onPress: () => Linking.openSettings() },
  ]);
}
```

### 扫码防抖

```typescript
const [scanned, setScanned] = useState(false);

// 扫码回调
const handleBarCodeScanned = useCallback(({ data, type }) => {
  if (scanned) return; // 防止重复触发
  setScanned(true);    // 立即暂停扫描
  // ... 处理结果
}, [scanned]);

// 从 Modal 返回时重置
useFocusEffect(useCallback(() => {
  setScanned(false);
}, []));
```

### 扫描动画

```typescript
// react-native-reanimated 驱动
const translateY = useSharedValue(0);

useEffect(() => {
  if (isScanning) {
    translateY.value = withRepeat(
      withSequence(
        withTiming(FRAME_SIZE - 4, { duration: 2000 }),
        withTiming(0, { duration: 0 })
      ),
      -1, // 无限循环
      false
    );
  }
}, [isScanning]);
```

### 历史记录存储

```typescript
// AsyncStorage 存储
const STORAGE_KEY = '@scan_history';
const MAX_RECORDS = 200;

// 添加记录
const addRecord = async (data: string, type: string) => {
  const history = await getHistory();
  const newRecord = { id: Date.now().toString(), data, type, timestamp: Date.now() };
  const updated = [newRecord, ...history].slice(0, MAX_RECORDS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
```

## ⚠️ 注意事项

### 相机权限

- iOS 需要在 `app.json` 中配置 `infoPlist` 权限说明
- Android 需要在 `app.json` 中配置 `permissions`
- 权限被拒绝后需要引导用户手动开启

### 扫码性能

- `barcodeScannerSettings` 可配置支持的码制，减少不必要的识别
- 扫码成功后立即暂停，避免性能浪费
- 使用 `useCallback` 优化回调函数

### 存储限制

- AsyncStorage 建议存储不超过 2MB 数据
- 历史记录限制 200 条，超出自动淘汰最旧记录
- 避免存储过大的扫码内容

### 兼容性

- 需要 Expo SDK 54+
- iOS 13.0+ / Android 6.0+
- 不支持 Expo Go 的完整相机功能，建议使用 Development Build

## 📝 更新日志

### v1.0.0 (2026-06-03)

- ✨ 初始版本发布
- 🔍 实现 QR Code 和条形码扫描
- 🎨 深色主题 UI 设计
- 📜 历史记录功能
- 🔦 闪光灯控制
- 📳 触觉反馈
- 🔗 URL 智能识别和打开

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- GitHub: [@hlw422](https://github.com/hlw422)
- 项目地址: [rn_every_scan](https://github.com/hlw422/rn_every_scan)
