#!/usr/bin/env bash
set -e

# 简化版 Android 构建脚本
# 执行 eas build -p android --profile production 并转换 AAB 为 APK

echo "🚀 开始 Android Production 构建..."

# 检查 eas-cli
if ! command -v eas >/dev/null 2>&1; then
    echo "❌ 请先安装 eas-cli: npm i -g eas-cli"
    exit 1
fi

# 检查 bundletool
BUNDLETOOL=~/tools/bundletool.jar
if [ ! -f "$BUNDLETOOL" ]; then
    echo "❌ 找不到 bundletool: $BUNDLETOOL"
    echo "👉 请从 https://github.com/google/bundletool/releases 下载"
    exit 1
fi

# 创建目录
mkdir -p ./builds ./output

# 执行 EAS 构建
echo "📦 执行 EAS 构建..."
eas build -p android --profile production --non-interactive --clear-cache

# 下载构建产物
echo "⬇️  下载构建产物..."
eas build:download --latest --output ./builds

# 找到 AAB 文件
AAB_FILE=$(ls -t ./builds/*.aab 2>/dev/null | head -n 1)
if [ -z "$AAB_FILE" ]; then
    echo "❌ 未找到 AAB 文件"
    exit 1
fi

echo "📱 找到 AAB 文件: $AAB_FILE"

# 转换 AAB 为 APK
echo "🔄 转换 AAB 为 APK..."
APKS_FILE="./output/app.apks"
APK_FILE="./output/universal.apk"

java -jar "$BUNDLETOOL" build-apks \
    --bundle="$AAB_FILE" \
    --output="$APKS_FILE" \
    --mode=universal

# 解压 APK
unzip -o "$APKS_FILE" universal.apk -d ./output >/dev/null
mv ./output/universal.apk "$APK_FILE"
rm -f "$APKS_FILE"

echo "✅ 构建完成！"
echo "📱 APK 文件: $APK_FILE"
ls -lh "$APK_FILE"
