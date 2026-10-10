# 经营管理中台演示 Demo V5

静态演示页面。首页为 `index.html`，其他分析页面位于 `views.html`。页面中的经营数据均为虚构演示数据。

图形入场动效统一由 `motion.js` 管理，页面切换和筛选后新增的图形也会自动绑定；系统设置“减少动态效果”时保留静态图形。发布前更新 `index.html`、`views.html` 和 `views.js` 中的同一版本参数，避免旧缓存混用资源。

本地回归检查：安装 Playwright 和 Chromium 后运行 `python3 tests/smoke.py`。仓库使用 `.githooks/pre-push` 在每次本机推送前检查首页、七个视图、主要交互、图形动效及手机版展示；首次克隆后执行 `git config core.hooksPath .githooks` 启用。
