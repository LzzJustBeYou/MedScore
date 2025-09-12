#!/bin/zsh

# ========== 配置 ==========
BUNDLETOOL=~/tools/bundletool.jar   # 你的 bundletool 路径
AAB_FILE=$1                         # 第一个参数：.aab 文件路径
OUTPUT_DIR=./output                 # 输出目录
APKS_FILE=$OUTPUT_DIR/app.apks
APK_FILE=$OUTPUT_DIR/universal.apk

# ========== 检查 ==========
if [ -z "$AAB_FILE" ]; then
  echo "❌ 用法: ./aab-to-apk.sh <app-release.aab>"
  exit 1
fi

if [ ! -f "$AAB_FILE" ]; then
  echo "❌ 文件不存在: $AAB_FILE"
  exit 1
fi

if [ ! -f "$BUNDLETOOL" ]; then
  echo "❌ 找不到 bundletool: $BUNDLETOOL"
  echo "👉 请先下载 https://github.com/google/bundletool/releases"
  exit 1
fi

# ========== 转换 ==========
echo "🚀 使用 bundletool 转换 AAB → APK..."
mkdir -p $OUTPUT_DIR

java -jar $BUNDLETOOL build-apks \
  --bundle=$AAB_FILE \
  --output=$APKS_FILE \
  --mode=universal

echo "📦 解压 universal.apk..."
unzip -o $APKS_FILE universal.apk -d $OUTPUT_DIR >/dev/null

if [ -f "$APK_FILE" ]; then
  echo "✅ 已生成 APK: $APK_FILE"
else
  echo "❌ 转换失败，没有找到 universal.apk"
fi
