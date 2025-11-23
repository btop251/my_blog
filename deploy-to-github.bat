@echo off
echo 开始部署到 GitHub...

:: 检查是否在 Git 仓库中
if not exist ".git" (
    echo 初始化 Git 仓库...
    git init
)

:: 添加所有文件
echo 添加文件到 Git...
git add .

:: 提交更改
echo 提交更改...
git commit -m "部署更新: %date% %time%"

:: 推送到 GitHub
echo 推送到 GitHub...
git push origin main

echo ✅ 部署完成！
pause