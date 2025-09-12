#!/usr/bin/env bash
set -euo pipefail

# =============================
# EAS 一键打包脚本（Android/iOS）
# - 可选更新 app.json 中的版本号
# - 触发 EAS Build
# - 自动下载最新产物到 ./builds
# - 可选用 bundletool 将 AAB 转成 universal APK
# 依赖：eas-cli、jq（改版本时用）、java（转换 APK 时用）
# =============================

# 默认参数
PLATFORM="android"               # android | ios
PROFILE="production"             # 对应 eas.json 中的 profile
APP_JSON="app.json"
VERSION=""                       # 如 1.0.1（不传则不改）
ANDROID_VERSION_CODE=""          # 如 2（不传则不改）
IOS_BUILD_NUMBER=""              # 如 2（不传则不改）
DOWNLOAD_DIR="./builds"
CONVERT_APK="false"
BUNDLETOOL_JAR=~/tools/bundletool.jar               
APK_OUT_DIR="./builds/apk"

usage() {
  cat <<EOF
用法:
  $(basename "$0") [-p android|ios] [-r profile] [--version 1.0.1] [--android-version-code 2] [--ios-build-number 2] [--convert-apk --bundletool /path/to/bundletool.jar]

示例:
  # 仅 Android，使用 production profile，更新版本并下载 AAB
  $(basename "$0") -p android -r production --version 1.0.1 --android-version-code 2

  # iOS 构建并下载
  $(basename "$0") -p ios -r production --version 1.0.1 --ios-build-number 2

  # Android 构建 + 将 AAB 转 universal APK
  $(basename "$0") -p android -r production --convert-apk --bundletool ~/Downloads/bundletool-all-1.18.1.jar

参数:
  -p, --platform                平台: android | ios（默认 android）
  -r, --profile                 eas.json 的 profile（默认 production）
  --version                     更新 expo.version（不传则不改）
  --android-version-code        更新 android.versionCode（不传则不改）
  --ios-build-number            更新 ios.buildNumber（不传则不改）
  --app-json                    app.json 路径（默认 app.json）
  --convert-apk                 将下载的 .aab 转成 universal APK（仅 android）
  --bundletool                  bundletool 的 .jar 路径，配合 --convert-apk 使用
  --download-dir                构建产物下载目录（默认 ./builds）
  --apk-out-dir                 APK 输出目录（默认 ./builds/apk）
  -h, --help                    显示帮助
EOF
}

# 解析参数
while (( "$#" )); do
  case "$1" in
    -p|--platform) PLATFORM="$2"; shift 2;;
    -r|--profile) PROFILE="$2"; shift 2;;
    --version) VERSION="$2"; shift 2;;
    --android-version-code) ANDROID_VERSION_CODE="$2"; shift 2;;
    --ios-build-number) IOS_BUILD_NUMBER="$2"; shift 2;;
    --app-json) APP_JSON="$2"; shift 2;;
    --convert-apk) CONVERT_APK="true"; shift 1;;
    --bundletool) BUNDLETOOL_JAR="$2"; shift 2;;
    --download-dir) DOWNLOAD_DIR="$2"; shift 2;;
    --apk-out-dir) APK_OUT_DIR="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "未知参数：$1"; usage; exit 1;;
  esac
done

# 基础检查
command -v eas >/dev/null 2>&1 || { echo "❌ 未安装 eas-cli，请先执行：npm i -g eas-cli"; exit 1; }
mkdir -p "$DOWNLOAD_DIR"

# 可选：更新版本号（需要 jq）
if [[ -n "${VERSION}" || -n "${ANDROID_VERSION_CODE}" || -n "${IOS_BUILD_NUMBER}" ]]; then
  command -v jq >/dev/null 2>&1 || { echo "❌ 需要 jq 来修改 ${APP_JSON}，请安装：brew install jq"; exit 1; }
  [[ -f "$APP_JSON" ]] || { echo "❌ 找不到 ${APP_JSON}"; exit 1; }

  echo "📝 更新 ${APP_JSON} 中的版本字段…"
  TMP_JSON="${APP_JSON}.tmp"

  # 构造 jq 表达式
  JQ_EXPR='.expo as $e | $e'
  if [[ -n "$VERSION" ]]; then
    JQ_EXPR+=' | .expo.version="'$VERSION'"'
    # 同步 iOS buildNumber（字符串）
    if [[ -n "$IOS_BUILD_NUMBER" ]]; then
      JQ_EXPR+=' | .expo.ios.buildNumber="'$IOS_BUILD_NUMBER'"'
    fi
  fi
  if [[ -n "$ANDROID_VERSION_CODE" ]]; then
    JQ_EXPR+=' | .expo.android.versionCode='$ANDROID_VERSION_CODE
  fi
  if [[ -n "$IOS_BUILD_NUMBER" && -z "$VERSION" ]]; then
    # 只改 iOS buildNumber
    JQ_EXPR+=' | .expo.ios.buildNumber="'$IOS_BUILD_NUMBER'"'
  fi

  # 执行 jq 修改
  jq "$JQ_EXPR" "$APP_JSON" > "$TMP_JSON"
  mv "$TMP_JSON" "$APP_JSON"
  echo "✅ 已更新 ${APP_JSON}"
fi

echo "🚀 开始 EAS 构建：platform=${PLATFORM}, profile=${PROFILE}"
# 非交互，避免卡输入
eas build -p "$PLATFORM" --profile "$PROFILE" --non-interactive

echo "⏬ 下载最新构建产物到：${DOWNLOAD_DIR}"
# 下载最新产物
eas build:download -p "$PLATFORM" --profile "$PROFILE" --latest --output "$DOWNLOAD_DIR"

echo "✅ 构建产物已下载完成："
ls -lh "$DOWNLOAD_DIR" | sed -n '1,10p'

# 如需转换 APK
if [[ "$PLATFORM" == "android" && "$CONVERT_APK" == "true" ]]; then
  [[ -n "$BUNDLETOOL_JAR" ]] || { echo "❌ 需要指定 --bundletool /path/to/bundletool.jar"; exit 1; }
  [[ -f "$BUNDLETOOL_JAR" ]] || { echo "❌ 找不到 bundletool: $BUNDLETOOL_JAR"; exit 1; }

  # 找到最新 AAB
  AAB_FILE="$(ls -t "${DOWNLOAD_DIR}"/*.aab 2>/dev/null | head -n 1 || true)"
  [[ -n "$AAB_FILE" ]] || { echo "❌ 在 ${DOWNLOAD_DIR} 未找到 .aab 文件"; exit 1; }

  mkdir -p "$APK_OUT_DIR"
  APKS_FILE="${APK_OUT_DIR}/$(basename "${AAB_FILE%.aab}").apks"
  APK_FILE="${APK_OUT_DIR}/$(basename "${AAB_FILE%.aab}")-universal.apk"

  echo "🔁 AAB → universal APK："
  echo "  AAB:  $AAB_FILE"
  echo "  APKS: $APKS_FILE"
  echo "  APK:  $APK_FILE"

  command -v java >/dev/null 2>&1 || { echo "❌ 需要 Java 运行时（用来执行 bundletool）"; exit 1; }

  # 生成 apks（不签名，调试安装/验证足够；如需签名可扩展 --ks 相关参数）
  java -jar "$BUNDLETOOL_JAR" build-apks \
    --bundle="$AAB_FILE" \
    --output="$APKS_FILE" \
    --mode=universal

  # 解压 universal.apk
  unzip -o "$APKS_FILE" universal.apk -d "$APK_OUT_DIR" >/dev/null
  mv -f "$APK_OUT_DIR/universal.apk" "$APK_FILE"

  if [[ -f "$APK_FILE" ]]; then
    echo "✅ 已生成 APK：$APK_FILE"
  else
    echo "❌ 未找到生成的 APK"
    exit 1
  fi
fi

echo "🎉 完成！"
