# Project: cc-home（前端）

## 简介
私人AI对话平台前端，用于与接入Ombre Brain记忆库的AI进行对话和记忆管理。

## 技术栈
- React 19 + Vite
- JavaScript（非TypeScript）
- CSS（无UI框架）

## 项目结构
- src/App.jsx — 路由入口（Welcome页 / Chat页）
- src/Chat.jsx — 核心对话组件
- src/Welcome.jsx — 欢迎/登录页
- public/ — 静态资源

## 后端API
- 地址通过环境变量 VITE_API_BASE_URL 配置
- 对话接口: POST /chat（流式SSE响应）
- 配置接口: POST /admin/config

## 规范
- 保持现有代码风格（函数组件 + hooks）
- 不要引入TypeScript
- 不要引入UI框架（保持手写CSS）
- 中文注释
- 不要修改 .env 文件内容
