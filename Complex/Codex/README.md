# 城市无障碍 · 原型（iPhone 15 Pro 模拟）

本原型为一个围绕“城市无障碍”的视频 + 图文社区（融合 B 站/小红书交互），以原生 HTML/CSS/JS 实现：

- iPhone 15 Pro 设备容器（393×852，圆角、动态岛、状态栏、Tab Bar）
- 首页视频自动播放/暂停（IntersectionObserver，60% 可视阈值）
- 点赞/收藏微动画（WAAPI + 粒子），Chip Ripple，Skeleton 骨架
- 下拉弹性刷新、话题瀑布流（CSS columns）、轻视差
- 详情页双击放大、评分条、去这里（View Transitions API 跨页降级）
- 设置页：主题/大字/高对比/减少动效

## 打开方式

1. 使用任意静态服务器或直接双击 `index.html`（推荐 Chrome）。
2. 在 `index.html` 左侧目录中选择页面，右侧网格以 iFrame 平铺预览各 `screens/*.html`。
3. 如需单独预览，直接打开相应 `screens/*.html` 文件。

## 文件结构

- `index.html` 网格预览（左目录 + 右侧 iFrame 模拟器）
- `styles/global.css` 主题变量、设备容器、组件样式（Skeleton、Segment、Ripple、Tab Bar 等）
- `scripts/app.js` 主题与偏好、Tab 高亮、Ripple、点赞/收藏、下拉刷新、搜索建议、双击放大等
- `scripts/observer.js` IntersectionObserver 自动播放、懒加载、轻视差
- `scripts/waapi.js` 微动画封装（bounce、particles、progress）
- `screens/*.html` 各业务页面

技术栈：Tailwind CDN、原生 JS、Font Awesome。第三方动效/滚动库未使用。

## 已知限制

- 视图转场（View Transitions）跨文档在新 Chromium 上可用，其他浏览器会自动降级为普通跳转。
- 所有媒体均使用远程 URL（Unsplash / MDN CC0 视频），首次打开取决于网络状况。

## 真实媒体来源（示例）

图片（Unsplash 源·根据关键字随机）：

- https://source.unsplash.com/800x600/?wheelchair,ramp
- https://source.unsplash.com/800x600/?accessible,elevator
- https://source.unsplash.com/800x600/?tactile,paving
- https://source.unsplash.com/800x600/?accessible,toilet
- https://source.unsplash.com/1200x800/?city,map
- https://source.unsplash.com/1200x600/?city,skyline
- https://source.unsplash.com/200x200/?person,wheelchair
- https://source.unsplash.com/100x100/?person,volunteer
- https://source.unsplash.com/100x100/?person,city

视频（CC0 示例）：

- https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4
- https://interactive-examples.mdn.mozilla.net/media/cc0-videos/beer.mp4

如需替换为更贴合主题的 Pexels 视频，将 `<source>` 的 `src` 替换为可直链的 MP4 即可。

## 无障碍与降级策略

- 语义化：main/nav/header/footer 等语义标签 + aria-* 标注
- 焦点可见：`:focus-visible` 定制
- 减少动效：系统 `prefers-reduced-motion` 与设置页开关共同约束
- IO 降级：不支持 IntersectionObserver 时使用滚动回退逻辑

## 一键复制/下载

- 将整个文件夹拷贝到本地，即可直接打开 `index.html` 预览（或使用任何静态服务器）。
- 若需打包 zip：选择当前目录全部文件压缩即可。

---

验收清单（人工快速检查）

- [ ] 控制台 0 错误
- [ ] 所有 `<img>` 加载（或显示错误态背景）
- [ ] 首页视频随滚动自动播/停
- [ ] 点赞/收藏有弹跳和粒子微动画
- [ ] Tab Bar 高亮正确 & 页面跳转
- [ ] `prefers-reduced-motion`/设置页“减少动效”下动画明显减少
- [ ] 主题深浅切换正常、字体大小与高对比可用
- [ ] 设备容器 393×852，圆角与动态岛、状态栏无错位

