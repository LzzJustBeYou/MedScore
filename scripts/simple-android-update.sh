#!/usr/bin/env bash
set -e

# 简化版 Android 更新脚本
# 执行 eas update -p android 进行 OTA 更新

echo "🚀 开始 Android OTA 更新..."

# 检查 eas-cli
if ! command -v eas >/dev/null 2>&1; then
    echo "❌ 请先安装 eas-cli: npm i -g eas-cli"
    exit 1
fi

# 检查是否已登录
if ! eas whoami >/dev/null 2>&1; then
    echo "❌ 请先登录 EAS: eas login"
    exit 1
fi

# 生成更新消息
if [ -z "$1" ]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    MESSAGE="Android 更新 - $TIMESTAMP"
else
    MESSAGE="$1"
fi

echo "📱 更新消息: $MESSAGE"

# 执行 EAS 更新 (使用 --auto 让 EAS 自动选择)
echo "⬆️  执行 EAS 更新..."
eas update -p android --branch production --message "$MESSAGE" --non-interactive

echo "✅ Android 更新完成！"
echo "📱 用户将在下次打开应用时收到更新"
echo "ℹ️  提示：更新已推送到 EAS 服务器"
