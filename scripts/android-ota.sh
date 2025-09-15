#!/usr/bin/env bash
set -e

# ---------- 配置 ----------
DOWNLOAD_URL="$1"                        # 第一个参数传 AAB 下载链接
OUTPUT_DIR="./output"
BUNDLETOOL=~/tools/bundletool.jar       # bundletool 路径
BRANCH="production"
CHANNEL="production"

mkdir -p $OUTPUT_DIR

if [ -z "$DOWNLOAD_URL" ]; then
  echo "❌ 请提供 AAB 下载链接: $0 <AAB_DOWNLOAD_URL>"
  exit 1
fi

# ---------- Step 1: 下载 AAB ----------
AAB_FILE="$OUTPUT_DIR/app.aab"
echo "⬇️ 下载 AAB: $DOWNLOAD_URL"
curl -L "$DOWNLOAD_URL" -o "$AAB_FILE"

if [ ! -f "$AAB_FILE" ]; then
  echo "❌ 下载失败"
  exit 1
fi
echo "📱 下载完成: $AAB_FILE"

# ---------- Step 2: 转换 AAB 为 APK ----------
APKS_FILE="$OUTPUT_DIR/app.apks"
APK_FILE="$OUTPUT_DIR/universal.apk"

echo "🔄 转换 AAB 为 universal APK"
java -jar "$BUNDLETOOL" build-apks \
    --bundle="$AAB_FILE" \
    --output="$APKS_FILE" \
    --mode=universal

unzip -o "$APKS_FILE" universal.apk -d $OUTPUT_DIR >/dev/null
mv $OUTPUT_DIR/universal.apk "$APK_FILE"
rm -f "$APKS_FILE"

echo "✅ 转换完成！APK 文件路径: $APK_FILE"
ls -lh "$APK_FILE"

# ---------- Step 3: 发布 OTA 更新 ----------
echo "📦 发布 OTA 更新到 branch=$BRANCH / channel=$CHANNEL"
eas update --branch $BRANCH  --platform android --message "OTA 更新 - $(date '+%Y-%m-%d %H:%M:%S')"

echo "✅ 完整流程完成！"
echo "👉 安装 $APK_FILE 后，App 会自动拉取 OTA 更新"
