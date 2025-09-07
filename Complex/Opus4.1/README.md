# Accessibility Navigator - 城市无障碍导航社区

一个融合视频与图文的无障碍设施分享社区，专为轮椅使用者、长者群体、婴幼儿家庭和城市管理者设计。

## 项目概述

本项目是一个完整的移动端Web应用原型，模拟iPhone 15 Pro设备体验，提供了无障碍设施的发现、分享、协作和导航功能。

## 技术栈

- **HTML5** - 语义化标记
- **CSS3** - 原生样式与动画
- **JavaScript** - 原生交互逻辑
- **Web APIs** - IntersectionObserver, Web Animations API
- **响应式设计** - 针对iPhone 15 Pro优化（393×852px）

## 项目结构

```
/
├── index.html              # 主入口，iframe网格展示所有页面
├── styles/
│   └── global.css         # 全局样式、主题变量、组件样式
├── scripts/
│   ├── app.js            # 主应用逻辑、交互处理
│   ├── observer.js       # 滚动观察、懒加载
│   └── waapi.js          # Web Animations API封装
├── screens/              # 所有页面文件
│   ├── onboarding.html   # 引导页
│   ├── login.html        # 登录页
│   ├── signup.html       # 注册页
│   ├── home.html         # 首页（混合内容流）
│   ├── explore.html      # 发现（瀑布流）
│   ├── post_detail.html  # 帖子详情
│   ├── create_post.html  # 发布内容
│   ├── notifications.html# 通知中心
│   ├── messages.html     # 私信列表
│   ├── profile.html      # 个人主页
│   ├── settings.html     # 设置页面
│   ├── report_issue.html # 问题上报
│   └── route_preview.html# 路线预览
└── README.md             # 项目文档
```

## 核心功能

### 1. 无障碍设施标记
- 坡度百分比
- 门宽尺寸
- 电梯状态
- 无障碍卫生间
- 盲道情况
- 停车位

### 2. 内容分享
- 视频/图文混合发布
- 地点标签
- 设施评分系统
- 社区协作纠错

### 3. 智能推荐
- 基于位置的内容推荐
- 热门话题追踪
- 个性化内容流

### 4. 路线导航
- 无障碍路径规划
- 关键节点提示
- 实时设施状态

## 交互特性

### 动画效果
- 点赞心形粒子动画
- 收藏弹跳效果
- 下拉弹性刷新
- 卡片视差滚动
- 骨架屏加载
- View Transitions（降级兼容）

### 手势支持
- 左滑删除/操作
- 横向滑动切换
- 下拉刷新
- 双击放大图片

### 无障碍支持
- 语义化HTML标签
- ARIA属性标注
- 键盘导航支持
- 高对比度模式
- 字体大小调节
- 减少动效选项

## 本地运行

1. 克隆或下载项目文件
2. 使用现代浏览器打开 `index.html`
3. 推荐使用Chrome开发者工具的设备模拟器查看iPhone 15 Pro效果

```bash
# 使用Python简单服务器
python3 -m http.server 8000

# 或使用Node.js
npx serve .
```

## 浏览器兼容性

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

## 图片资源

所有图片均使用真实URL，来源于：
- Unsplash (https://unsplash.com)
- Pexels (https://pexels.com)

关键词搜索：
- wheelchair ramp
- accessible elevator
- tactile paving
- city metro
- accessible bathroom

## 已知限制

1. 视频自动播放需要用户交互或静音
2. 部分手势在桌面浏览器需要模拟
3. 地图导航为静态预览
4. 推送通知需要HTTPS环境

## 性能优化

- 图片懒加载
- 视频可视区域自动播放
- 骨架屏预加载
- CSS动画硬件加速
- 防抖节流处理

## 可访问性检查清单

- [x] 语义化HTML结构
- [x] 适当的标题层级
- [x] 表单标签关联
- [x] 键盘可访问
- [x] 焦点样式可见
- [x] 颜色对比度达标
- [x] 支持屏幕阅读器
- [x] 响应式文字大小
- [x] 触摸目标尺寸合适
- [x] 动效可关闭

## 测试账号

- 用户名：demo
- 密码：demo

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue。

---

**注意**：本项目为原型演示，部分功能（如实时定位、支付、推送等）需要后端支持。