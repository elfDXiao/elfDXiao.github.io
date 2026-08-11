# 个人主页（GitHub Pages）

这是我的个人主页网站，托管在 GitHub Pages 上，永久免费、无需服务器。

## 项目结构

```
个人网站托管/
├── index.html      # 网页主页面
├── css/style.css   # 样式表
├── js/main.js      # 交互脚本
└── README.md       # 本说明
```

## 本地预览

直接用浏览器打开 `index.html` 即可预览。

## 修改内容

- **名字 / 打字机效果**：打开 `js/main.js`，修改第 8 行的 `fullName`。
- **个人介绍、项目、技能**：打开 `index.html`，找到对应区块（`About` / `Skills` / `Projects`）直接改文字。
- **头像**：把图片放到 `assets/` 目录，替换首屏的圆形头像占位。
- **邮箱 / 社交链接**：搜索 `your@email.com` 和「你的用户名」替换成真实信息。

## 发布到 GitHub

1. 在 GitHub 新建仓库，名字建议为 `你的用户名.github.io`（这样才能用
   `https://你的用户名.github.io` 访问）。
2. 在仓库 Settings → Pages 中，把发布来源选为分支的 `main` / `root`。
3. 每次修改后用 `git add .` + `git commit` + `git push` 上传，网站自动更新。