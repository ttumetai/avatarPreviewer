# Avatar Previewer

<p align="center">
  <img src="https://github.com/user-attachments/assets/f6b4a048-cc7e-4e57-b1bb-f341a4ed66c9" alt="Avatar Previewer 效果示例" width="100%">
</p>

头像预览器 — 上传一张图片，预览它在各大社交平台的头像效果。

支持 10 个平台：微信朋友圈、QQ空间、微博、哔哩哔哩、抖音、小红书、GitHub、Twitter/X、Discord、Telegram。

## 功能

- 拖拽或点击上传头像图片
- 上传后自动弹出裁剪编辑器（支持裁剪、旋转、拖拽调整）
- 头像裁剪锁定 1:1 比例，背景图自由裁剪
- 10 个平台实时预览，竖向排列，宽度对齐
- 可选上传自定义背景图，替换各平台封面/横幅区域
- 纯前端实现，无需后端，无需构建

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/ttumetai/avatarPreviewer.git
cd avatarPreviewer

# 启动本地服务器
python3 -m http.server -d frontend 8000

# 打开浏览器
open http://localhost:8000
```

任何静态文件服务器都可以（`npx serve frontend`、Nginx、直接打开 HTML 等）。

## 技术栈

- **Vue 3** — CDN 加载，Composition API
- **Canvas API** — 图片裁剪与旋转
- **纯 HTML/CSS/JS** — 无 npm、无构建步骤、零依赖

## 项目结构

```
frontend/
├── index.html      # 主页面 + 10 个平台 UI 组件
├── app.js          # Vue 3 应用逻辑
├── cropper.js      # Canvas 裁剪/旋转编辑器
├── cropper.css     # 裁剪器样式
└── style.css       # 平台 UI 样式
```

## 平台 UI 说明

各平台 UI 基于真实页面源码还原，通过 Lightpanda 无头浏览器抓取参考：

| 平台 | CSS 前缀 | 特点 |
|------|---------|------|
| 微信朋友圈 | `wx-` | 深色封面 + 右下角方形头像卡片 |
| QQ空间 | `qzone-` | 暖色渐变 + 圆形头像 + 底部5宫格导航 |
| 微博 | `wb-` | 红色覆盖层 + 关注/粉丝统计 |
| 哔哩哔哩 | `bili-` | bili-avatar 组件 + 大会员 + 等级进度条 |
| 抖音 | `dy-` | 红色边框头像 + 关注/私信按钮 |
| 小红书 | `xhs-` | 渐变光环头像 + 标签 + 获赞与收藏 |
| GitHub | `gh-` | 260px 大圆头像 + Follow 按钮 |
| Twitter/X | `tw-` | 白色边框头像 + 金色认证徽章 |
| Discord | `dc-` | 深色主题 popout + 角色标签 |
| Telegram | `tg-` | 居中卡片 + 蓝色认证 + Send Message |

## 许可证

MIT

## 致谢

- [Vue 3](https://vuejs.org/) — 前端框架
- [Lightpanda](https://lightpanda.io/) — 无头浏览器，用于抓取平台页面源码
- Xiaomi Mimo — 由小米大模型 core 团队开发的 AI 助手，协助完成全部代码编写
