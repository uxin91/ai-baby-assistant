# AI 育儿助手

一款基于 React Native + Expo 开发的智能育儿助手 App，帮助新手父母记录宝宝成长、管理喂养睡眠，并通过“小芽”回答育儿问题。

## 功能

- AI 智能问答：优先调用在线大模型接口，异常时自动回落到本地育儿知识库。
- 宝宝成长记录：维护宝宝基本信息，记录身高、体重、头围和发育里程碑。
- 喂养与睡眠记录：记录母乳、奶瓶、辅食和睡眠质量，展示当天统计。
- 辅食食谱推荐：按月龄筛选 6-18 个月宝宝辅食食谱。
- 本地数据持久化：使用 AsyncStorage 保存聊天、成长、喂养和睡眠数据。

## 技术栈

- React Native + Expo SDK 54
- TypeScript
- React Navigation
- AsyncStorage
- Expo Vector Icons

## 配置在线接口

复制 `.env.example` 为 `.env.local`，然后填写 OpenAI 协议接口配置：

```bash
EXPO_PUBLIC_AI_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2
EXPO_PUBLIC_AI_MODEL_ID=astron-code-latest
EXPO_PUBLIC_AI_PROXY_URL=http://localhost:8787

AI_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2
AI_API_KEY=your-api-key
AI_PROXY_PORT=8787
```

当前本地工作区已经创建了 `.env.local`。该文件被 `.gitignore` 忽略，不会提交到仓库。

> 注意：`EXPO_PUBLIC_*` 环境变量会被打包到客户端，适合当前原型和本地测试。正式上线时建议增加后端代理，由服务端保存 API Key。

## 快速开始

```bash
npm install
npm start
```

常用命令：

```bash
npm run proxy:ai
npm run web
npm run android
npm run ios
npm run typecheck
```

## 项目结构

```text
ai-baby-assistant/
├── App.tsx
├── src/
│   ├── data/
│   │   ├── aiKnowledge.ts
│   │   ├── milestones.ts
│   │   └── recipes.ts
│   ├── screens/
│   │   ├── ChatScreen.tsx
│   │   ├── GrowthScreen.tsx
│   │   ├── TrackingScreen.tsx
│   │   └── RecipesScreen.tsx
│   ├── services/
│   │   └── aiAssistant.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── storage.ts
├── app.json
└── package.json
```
