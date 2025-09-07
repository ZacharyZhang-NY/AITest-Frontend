# 无障碍城市社区 - 前端原型

这是一个基于原生 Web 技术构建的高保真前端原型，旨在模拟一个关注城市无障碍设施的视频图文社区 App。

## 如何本地运行

1.  将所有文件（`index.html`, `styles/`, `scripts/`, `screens/`）下载到同一目录下。
2.  使用支持本地文件访问的 Web 服务器（如 VS Code 的 "Live Server" 扩展）打开 `index.html`。直接在浏览器中打开文件可能会因 CORS 策略限制 `iframe` 功能。
3.  `index.html` 将作为一个仪表盘，平铺展示所有独立的屏幕页面。

## 技术栈

-   **HTML5**
-   **Tailwind CSS (CDN)**: 用于快速构建 UI。
-   **Font Awesome (CDN)**: 用于图标。
-   **Vanilla JavaScript (ES6+)**: 用于实现所有交互逻辑。
-   **原生 Web API**:
    -   `IntersectionObserver`: 用于视频自动播放/暂停、懒加载。
    -   `Web Animations API (WAAPI)`: 用于轻量级微交互。
    -   `prefers-reduced-motion`: 尊重用户的系统动效偏好。
    -   `localStorage`: 用于持久化主题设置。

## 已知限制

-   这是一个纯前端原型，没有后端逻辑。所有数据都是静态的。
-   导航通过直接链接到相应的 `.html` 文件实现，模拟页面跳转。
-   表单提交、登录/注册等功能仅为 UI 展示。
-   “打开地图 App”等与外部应用交互的按钮仅为占位符。

## 真实资源来源

所有图片和视频均来自 Pexels 和 Unsplash，遵循其许可协议。

### 图片 (部分示例)
-   **用户头像:**
    -   `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`
    -   `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`
-   **内容卡片:**
    -   轮椅坡道: `https://images.pexels.com/photos/3829175/pexels-photo-3829175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`
    -   地铁电梯: `https://images.pexels.com/photos/1059823/pexels-photo-1059823.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`
    -   触感铺路: `https://images.pexels.com/photos/7853230/pexels-photo-7853230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`
-   **路线预览:**
    -   `https://images.pexels.com/photos/16033313/pexels-photo-16033313/free-photo-of-a-map-of-a-city-with-a-river-and-buildings.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`

### 视频
-   `https://videos.pexels.com/video-files/8571795/8571795-hd_1080_1920_25fps.mp4`
-   `https://videos.pexels.com/video-files/854123/854123-hd_1080_1920_30fps.mp4`
-   `https://videos.pexels.com/video-files/4690251/4690251-hd_1080_1920_24fps.mp4`
