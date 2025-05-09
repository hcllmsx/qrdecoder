# QRdecoder 浏览器扩展

## 简介
QRdecoder 是一款专为 Chrome/Edge 浏览器开发的二维码自动识别扩展。它可以自动或延迟扫描当前网页上的二维码，支持多二维码识别，支持内容一键复制和新标签页打开。

## 主要功能
- **立即扫描**：一键截图并识别当前网页可见区域的二维码。
- **延迟扫描**：固定3秒延迟，适合识别鼠标悬停后才出现的二维码。
- **区域截图**：可手动框选任意区域进行二维码识别，结果以网页右上角悬浮通知展示。
- **多二维码识别**：同屏多个二维码时，会分别展示所有内容，并提示是否有重复内容。
- **内容操作**：识别结果支持一键复制、直接在新标签页打开网址。
- **友好界面**：简洁直观的弹窗UI，支持中文提示。

## 使用方法
1. 安装扩展后，点击浏览器工具栏上的 QRdecoder 图标。
2. 弹窗界面点击“立即扫描”、“延迟扫描(3秒)”或“区域截图”按钮。
3. 若选择延迟扫描，请在倒计时期间将鼠标悬停在二维码区域，等待自动截图。
4. 若选择区域截图，倒计时结束后可在网页上拖动框选任意区域，松开鼠标后自动识别二维码，结果将在网页右上角弹窗显示，可一键复制或新标签页打开。
5. 立即扫描和延迟扫描的识别结果会在弹窗内展示。

## 常见问题
- **无法识别悬浮二维码？**
  - 请使用“延迟扫描”功能，并确保倒计时期间二维码已完全显示。
- **区域截图识别不准？**
  - 请确保框选区域完整覆盖二维码，且页面未被遮挡、未被其他弹窗挡住。
- **多二维码内容重复？**
  - 扩展会自动提示“检测到多个二维码，内容均相同”。
- **识别失败？**
  - 请确保网页内容可见、二维码清晰，或尝试刷新页面后重试。

## 技术栈
- JavaScript (ES6)
- jsQR (二维码识别库)
- Chrome/Edge 扩展 API

## 目录结构
```
qrdecoder/
├── src/
│   ├── popup.html           # 扩展弹窗页面
│   ├── popup.js             # 弹窗逻辑与二维码识别
│   ├── background.js        # 后台脚本，截图与消息分发
│   ├── regionOverlay.js     # 区域截图内容脚本（页面遮罩与选区）
│   ├── cropAndDecodeQRCode.js # 后台截图裁剪与二维码识别
│   ├── qrNotify.js          # 识别结果网页悬浮通知脚本
│   ├── jsQR.js              # 二维码识别库
│   └── qrdecoder-icon.png   # 图标
├── manifest.json            # 扩展清单
└── README.md                # 使用说明
```
