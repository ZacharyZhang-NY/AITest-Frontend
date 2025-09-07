# 🦽 Accessibility Navigator | 城市无障碍导航社区

一个专注于城市无障碍设施的视频+图文社区原型，融合 B 站的视频流互动体验与小红书的图文分享功能。

![iPhone 15 Pro原型展示](https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop)

## ✨ 核心特性

### 📱 设备适配
- **iPhone 15 Pro 尺寸优化** - 393×852px，完美适配刘海屏
- **响应式设计** - 支持不同屏幕尺寸
- **PWA 就绪** - 可安装为原生应用体验

### 🎥 智能视频体验
- **自动播放控制** - IntersectionObserver 实现60%可见时自动播放
- **静音优化** - 遵循浏览器自动播放策略
- **性能优化** - 懒加载与视口管理

### ♿ 无障碍优先设计
- **完整 ARIA 支持** - 屏幕阅读器友好
- **键盘导航** - 全键盘操作支持
- **高对比度模式** - 视觉障碍用户友好
- **大字体选项** - 可调节字体大小
- **减少动效** - 支持 prefers-reduced-motion
- **语音反馈** - 可选的操作语音提示

### 🎨 主题系统
- **深色/浅色模式** - 跟随系统或手动切换
- **CSS 变量架构** - 灵活的主题定制
- **平滑过渡** - 无缝主题切换体验

### 🎭 原生动画
- **纯 CSS 实现** - 无第三方动画库依赖
- **Web Animations API** - 高性能微交互
- **触觉反馈** - 支持振动 API
- **粒子效果** - 点赞收藏微动画

## 🏗️ 技术架构

### 前端技术栈
- **HTML5** - 语义化标签，完整 ARIA 支持
- **CSS3** - Grid/Flexbox 布局，CSS 变量，原生动画
- **Vanilla JavaScript** - 纯原生 JS，零框架依赖
- **Web APIs** - IntersectionObserver、WAAPI、触摸事件

### 核心 API 使用
```javascript
// 视频自动播放控制
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
      entry.target.play();
    } else {
      entry.target.pause();
    }
  });
}, { threshold: 0.6 });

// 主题切换
document.documentElement.setAttribute('data-theme', theme);

// 微动画控制
element.animate([
  { transform: 'scale(1)' },
  { transform: 'scale(1.2)' },
  { transform: 'scale(1)' }
], { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
```

## 📁 项目结构

```
/
├── index.html              # 主入口 - iframe 网格展示
├── styles/
│   └── global.css          # 全局样式、主题、组件
├── scripts/
│   └── app.js              # 核心交互逻辑
├── screens/                # 所有页面屏幕
│   ├── onboarding.html     # 三屏引导 + 权限申请
│   ├── login.html          # 登录页 + 第三方登录
│   ├── signup.html         # 注册页 + 无障碍需求
│   ├── home.html           # 首页混合流 + 分段控制
│   ├── explore.html        # 发现页 + 瀑布流 + 搜索
│   ├── profile.html        # 个人主页 + Tab + 徽章
│   ├── settings.html       # 设置页 + 无障碍配置
│   └── notifications.html  # 通知中心
└── README.md               # 项目说明
```

## 🚀 快速开始

### 本地运行
```bash
# 1. 克隆或下载项目文件
git clone [项目地址] 或直接下载 ZIP

# 2. 启动本地服务器（推荐）
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8000

# 3. 访问项目
# 浏览器打开 http://localhost:8000
```

### 部署
- **静态托管** - 可直接部署到 GitHub Pages、Netlify、Vercel
- **CDN 优化** - 所有外部资源使用 CDN 加载
- **缓存策略** - 适当的资源缓存配置

## 📱 页面功能

### 🏠 首页 (home.html)
- **混合流内容** - 视频卡片与图文卡片交替
- **分段控制** - 推荐/关注/附近三个流
- **自动播放** - 智能视频播放控制
- **互动功能** - 点赞、收藏、评论、分享
- **下拉刷新** - 弹性刷新交互
- **无限滚动** - 自动加载更多内容

### 🧭 发现页 (explore.html)
- **智能搜索** - 实时搜索建议
- **筛选系统** - 多标签筛选（坡度、电梯、卫生间等）
- **瀑布流布局** - 双列自适应卡片
- **热门话题** - 排行榜展示
- **视差滚动** - 轻微视差效果

### 👤 个人主页 (profile.html)
- **动态封面** - 视差滚动头部
- **统计展示** - 粉丝、关注、获赞数据
- **Tab 切换** - 作品/收藏/足迹
- **徽章系统** - 成就展示
- **网格布局** - 作品九宫格展示

### ⚙️ 设置页 (settings.html)
- **主题切换** - 浅色/深色/跟随系统
- **无障碍配置** - 字体大小、高对比度、减少动效
- **通知管理** - 精细化通知控制
- **隐私设置** - 数据与隐私管理

## 🎯 交互特性

### 🎬 视频交互
- **60% 可视自动播放** - IntersectionObserver 精确控制
- **点击播放/暂停** - 用户主动控制
- **静音播放** - 符合浏览器策略
- **循环播放** - 短视频循环体验

### 💫 微动画
- **点赞粒子效果** - 心形粒子散射
- **收藏弹跳** - 书签图标弹跳
- **涟漪效果** - 按钮点击涟漪
- **骨架屏** - 优雅的加载状态

### 🎮 手势支持
- **滑动切换** - 引导页左右滑动
- **下拉刷新** - 首页弹性刷新
- **长按菜单** - 上下文菜单
- **双击缩放** - 图片详情页缩放

## 🌟 可访问性特性

### 🔍 屏幕阅读器支持
- **语义化标签** - 正确的 HTML 结构
- **ARIA 标签** - 完整的 aria-* 属性
- **焦点管理** - 清晰的焦点顺序
- **状态通知** - 动态内容更新通知

### ⌨️ 键盘导航
- **Tab 导航** - 所有交互元素可达
- **快捷键** - 方向键翻页等
- **焦点指示** - 清晰的焦点样式
- **跳转链接** - 快速跳转到主内容

### 🎨 视觉辅助
- **高对比度模式** - 增强文字对比度
- **大字体选项** - 可调节字体大小
- **色彩无关设计** - 不仅依赖颜色传达信息
- **适当间距** - 44px 最小点击区域

### 🔊 听觉辅助
- **语音反馈** - 操作确认语音
- **视觉提示** - 声音信息的视觉替代
- **字幕支持** - 视频内容字幕

## 🖼️ 图片资源

所有图片均来自免费图库，确保商用安全：

### Unsplash 图片源
```
用户头像: photo-1507003211169-0a1dd7228f2d (男性头像)
用户头像: photo-1494790108755-2616b612b096 (女性头像)
用户头像: photo-1472099645785-5658abf4ff4e (男性头像)
用户头像: photo-1438761681033-6461ffad8d80 (女性头像)

无障碍设施:
商场坡道: photo-1559827260-dc66d52bef19
地铁电梯: photo-1571019613454-1cb2f99b2d8b
医院设施: photo-1551076805-e1869033e561
公园步道: photo-1441974231531-c6227db76b6e
学校设施: photo-1580582932707-520aed937b7b
盲道设施: photo-1544027993-37dbfe43562a
```

### 视频资源
使用 Sample-Videos.com 提供的测试视频，遵循 CC 协议。

## 🔧 自定义配置

### 主题定制
```css
:root {
  /* 修改主色调 */
  --accent-blue: #007aff;
  --accent-green: #30d158;
  --accent-red: #ff453a;
  
  /* 字体配置 */
  --font-system: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  
  /* 动画时长 */
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;
}
```

### 功能开关
```javascript
// 在 app.js 中配置
const config = {
  enableAutoPlay: true,          // 视频自动播放
  enableParticleAnimation: true, // 粒子动画
  enableVoiceFeedback: true,     // 语音反馈
  enableHapticFeedback: true     // 触觉反馈
};
```

## 🐛 已知限制

### 技术限制
- **视频格式** - 依赖浏览器支持的格式
- **自动播放** - 受浏览器策略限制
- **触觉反馈** - 仅部分设备和浏览器支持
- **语音合成** - 需要现代浏览器支持

### 功能限制
- **离线支持** - 当前版本不支持离线访问
- **推送通知** - 需要后端服务支持
- **地理定位** - 需要用户授权
- **数据同步** - 当前仅本地存储

## 🚧 开发路线图

### 即将推出
- [ ] 帖子详情页完整实现
- [ ] 创建发布页面
- [ ] 问题上报功能
- [ ] 路线预览页面
- [ ] 私信功能

### 计划功能
- [ ] PWA 离线支持
- [ ] WebRTC 视频通话
- [ ] 多语言国际化
- [ ] 数据导出功能
- [ ] AI 智能推荐

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 代码规范
- 使用 2 空格缩进
- 遵循语义化 HTML
- CSS 按功能模块组织
- JavaScript 使用 ES6+ 语法

### 提交规范
```
feat: 添加新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/配置更新
```

## 📄 许可协议

本项目采用 MIT 许可协议 - 详见 [LICENSE](LICENSE) 文件

## 👏 致谢

- **Unsplash** - 提供高质量免费图片
- **Font Awesome** - 图标库支持
- **Sample-Videos** - 测试视频资源
- **MDN Web Docs** - 技术参考文档

## 📞 联系我们

- **项目地址**: [GitHub Repository]
- **问题反馈**: [Issues Page]
- **邮箱**: accessibility-nav@example.com

---

🌟 **让城市对每个人都更友好** - 这是我们的使命，也是这个项目的初心。

通过技术的力量，我们希望能够帮助更多人发现、分享和改善身边的无障碍设施，构建一个更加包容和友好的城市环境。

每一个功能的设计都考虑了不同用户的需求，每一行代码都承载着对无障碍理念的坚持。希望这个原型能够启发更多开发者关注可访问性设计，创造出真正适合所有人使用的产品。