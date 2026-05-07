# AI 育儿助手

一款基于 React Native + Expo 开发的智能育儿助手 App，帮助新手父母轻松育儿。

## 功能特性

### 🤖 AI 智能问答
- 内置丰富的育儿知识库（发烧、辅食、睡眠、母乳、湿疹、便秘、疫苗、出牙等）
- 关键词智能匹配，即时回答育儿问题
- 纯本地运行，无需网络，无需调用外部 API
- 中国大陆完全可用，不依赖任何海外服务

### 📊 宝宝成长记录
- 记录宝宝基本信息（昵称、生日、性别）
- 追踪身高、体重、头围变化
- 发育里程碑清单（大运动、语言、社交、认知）

### 🍼 喂养 & 睡眠记录
- 支持母乳/奶瓶/辅食三种喂养方式记录
- 睡眠时间和质量追踪
- 今日统计面板

### 🥣 辅食食谱推荐
- 按月龄分类的辅食食谱
- 详细的食材、做法、营养价值说明
- 覆盖 6-18 个月各阶段

## 技术栈

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **React Navigation** (底部标签导航)
- **AsyncStorage** (本地数据持久化)
- **Expo Vector Icons** (Ionicons 图标)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 在 Android 设备/模拟器上运行
npm run android

# 在 iOS 设备/模拟器上运行
npm run ios

# 在浏览器中运行
npm run web
```

## 项目结构

```
ai-baby-assistant/
├── App.tsx                   # 主入口，底部标签导航
├── src/
│   ├── screens/
│   │   ├── ChatScreen.tsx    # AI 智能问答页面
│   │   ├── GrowthScreen.tsx  # 成长记录页面
│   │   ├── TrackingScreen.tsx# 喂养 & 睡眠记录
│   │   └── RecipesScreen.tsx # 辅食食谱推荐
│   ├── data/
│   │   ├── aiKnowledge.ts    # AI 育儿知识库
│   │   ├── milestones.ts     # 发育里程碑数据
│   │   └── recipes.ts        # 辅食食谱数据
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   └── utils/
│       └── storage.ts        # 本地存储工具
├── app.json                  # Expo 配置
└── package.json
```

## 特点

- **完全离线可用** - 所有数据本地存储，AI 知识库本地运行
- **中国大陆友好** - 不依赖任何需要翻墙的服务
- **跨平台** - 同时支持 iOS、Android 和 Web
- **隐私安全** - 所有数据仅存储在用户设备本地
