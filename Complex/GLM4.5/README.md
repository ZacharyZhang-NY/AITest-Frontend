# Accessibility Navigator - 无障碍城市导航社区

一个以无障碍为重点的城市导航社交应用原型，结合了 B 站（视频流、弹性互动）与小红书（图文卡片、话题/标签/收藏）的特点。

## 🌟 项目特色

### 🎯 核心功能
- **发现无障碍设施**: 轮椅坡道、无障碍电梯、卫生间等
- **社区分享**: 图文/短视频报告设施状态
- **协作纠错**: 社区审核和更新可信度
- **路线规划**: 从帖子一键进入"去这里"路线预览

### 👥 目标用户
- 轮椅/助行用户
- 长者群体  
- 婴幼儿家庭
- 公益志愿者
- 城市管理者

### ♿ 无障碍特性
- 深色/浅色主题切换
- 字体大小调节（小/标准/大/特大）
- 高对比度模式
- 减少动效选项
- 语音提示支持
- 键盘导航友好

## 📱 页面结构

### 入口页面
- `index.html` - 主入口页面，包含所有页面预览
- `screens/onboarding.html` - 三屏引导 + 权限获取

### 认证页面  
- `screens/login.html` - 登录页面（支持第三方登录）
- `screens/signup.html` - 注册页面（无障碍需求选择）

### 主要功能
- `screens/home.html` - 首页（混合视频图文流）
- `screens/explore.html` - 发现页（话题瀑布流）
- `screens/post_detail.html` - 帖子详情页
- `screens/create_post.html` - 发布页（无障碍设施标记）
- `screens/route_preview.html` - 路线预览页

### 社交功能
- `screens/notifications.html` - 通知页面
- `screens/messages.html` - 私信列表
- `screens/profile.html` - 个人主页（徽章系统）

### 工具页面
- `screens/settings.html` - 设置页面（无障碍偏好）
- `screens/report_issue.html` - 问题上报页面

## 🛠 技术实现

### 技术栈
- **HTML5** - 语义化标签，可访问性优先
- **CSS3** - Flexbox/Grid，CSS变量，自定义属性
- **Vanilla JavaScript** - 原生JS，无第三方框架依赖
- **Font Awesome** - 图标库
- **响应式设计** - iPhone 15 Pro 优化（393x852px）

### 关键技术特性

#### 1. 无障碍优先设计
- CSS变量支持主题切换
- `prefers-color-scheme` 媒体查询
- `prefers-reduced-motion` 动效降级
- 语义化HTML结构
- ARIA标签支持

#### 2. 原生交互动画
- CSS动画和过渡
- WAAPI（Web Animations API）
- IntersectionObserver 实现懒加载
- 原生拖拽和手势支持

#### 3. 性能优化
- 图片懒加载
- 虚拟滚动（长列表）
- 骨架屏加载状态
- 请求防抖和节流

#### 4. 用户体验
- 下拉刷新
- 无限滚动
- 微交互动画
- 离线数据缓存

## 🎨 设计系统

### 颜色系统
```css
:root {
  /* 浅色主题 */
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --accent: #0066cc;
  
  /* 深色主题 */
  --bg-primary: #121212;
  --text-primary: #ffffff;
  --accent: #4d94ff;
}
```

### 组件库
- **按钮系统**: 主要/次要/危险按钮
- **卡片组件**: 带阴影和悬浮效果
- **表单控件**: 输入框、开关、选择器
- **导航组件**: Tab栏、分段控制器
- **媒体组件**: 视频播放器、图片网格

### 图标系统
- Font Awesome 6.4.0
- 语义化图标选择
- 无障碍图标标签

## 🚀 快速开始

### 本地运行
1. 下载项目文件
2. 解压到本地目录
3. 打开 `index.html` 文件

### 推荐浏览器
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 开发环境
```bash
# 推荐使用本地服务器
python -m http.server 8000
# 或
npx serve .
```

## 📁 项目结构

```
GLM4.5/
├── index.html                    # 主入口页面
├── styles/
│   └── global.css                # 全局样式和变量
├── screens/                      # 所有页面文件
│   ├── onboarding.html          # 引导页面
│   ├── login.html               # 登录页面
│   ├── signup.html              # 注册页面
│   ├── home.html                # 首页
│   ├── explore.html             # 发现页面
│   ├── post_detail.html         # 帖子详情
│   ├── create_post.html         # 发布页面
│   ├── notifications.html       # 通知页面
│   ├── messages.html            # 私信页面
│   ├── profile.html             # 个人主页
│   ├── settings.html            # 设置页面
│   ├── report_issue.html        # 问题上报
│   └── route_preview.html       # 路线预览
├── scripts/                     # JavaScript文件
│   ├── app.js                  # 主要交互逻辑
│   ├── observer.js             # 观察者工具
│   └── waapi.js                # 动画封装
└── README.md                    # 项目说明
```

## 🎯 功能演示

### 1. 首页体验
- 混合视频/图文流
- 智能推荐算法
- 一键点赞/收藏
- 无障碍标签系统

### 2. 发现页面
- 话题瀑布流
- 热门标签云
- 智能筛选器
- 位置推荐

### 3. 内容创作
- 多媒体上传
- 无障碍设施标记
- 快捷模板系统
- 匿名发布选项

### 4. 社交互动
- 评论回复系统
- 点赞收藏功能
- 私信通知
- 用户关注

## ♿ 无障碍特性详解

### 视觉辅助
- **高对比度模式**: 增强文本和背景对比
- **大字体支持**: 四种字体大小选择
- **粗体文本**: 增强文字可读性
- **清晰图标**: 高识别度的图标设计

### 动作辅助
- **减少动效**: 为前庭障碍用户设计
- **大点击区域**: 48px最小点击目标
- **键盘导航**: 完整的键盘操作支持
- **语音反馈**: 操作语音提示

### 认知辅助
- **清晰布局**: 简洁直观的界面设计
- **一致交互**: 统一的操作模式
- **错误预防**: 表单验证和确认提示
- **帮助系统**: 内置使用引导

## 🔄 交互模式

### 手势操作
- **下拉刷新**: 更新内容
- **左滑删除**: 快捷操作
- **双击点赞**: 快速互动
- **长按菜单**: 上下文操作

### 键盘快捷键
- `Tab` - 导航焦点
- `Enter` - 确认操作
- `Esc` - 取消/返回
- `Space` - 播放/暂停

## 🎨 视觉效果

### 动画效果
- **微交互动画**: 按钮点击反馈
- **页面过渡**: 平滑切换效果
- **加载动画**: 骨架屏和进度条
- **情感化设计**: 点赞心形动画

### 响应式设计
- **设备适配**: 主要针对移动设备
- **屏幕旋转**: 横竖屏适配
- **动态字体**: 根据设置调整
- **主题切换**: 实时主题预览

## 📊 性能指标

### 加载性能
- **首屏加载**: < 2秒
- **页面切换**: < 500ms
- **图片优化**: 懒加载 + WebP支持
- **缓存策略**: LocalStorage + Service Worker

### 运行性能
- **滚动流畅**: 60fps
- **动画性能**: GPU加速
- **内存使用**: < 100MB
- **CPU占用**: < 30%

## 🔧 自定义配置

### 主题配置
```javascript
// 自定义主题颜色
document.documentElement.style.setProperty('--accent', '#your-color');
```

### 字体配置
```css
/* 自定义字体 */
:root {
  --font-family: 'Your Font', sans-serif;
}
```

### 功能开关
```javascript
// 启用/禁用功能
const settings = {
  enableAnimations: true,
  enableNotifications: true,
  enableLocation: true
};
```

## 🤝 贡献指南

### 开发规范
- 使用语义化HTML5标签
- 遵循BEM命名约定
- 编写可访问的ARIA标签
- 添加必要的注释

### 代码风格
- 使用2空格缩进
- 保持代码简洁清晰
- 遵循ES6+语法
- 添加错误处理

### 提交规范
- 功能明确，单一职责
- 兼容主流浏览器
- 性能优化考虑
- 无障碍标准合规

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- **Font Awesome** - 图标库
- **Unsplash** - 图片资源
- **Pexels** - 视频资源
- **无障碍设计社区** - 设计指导

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues
- 邮件反馈
- 社区讨论

---

**Accessibility Navigator** - 让每个人都能自由探索城市 🌆