#!/usr/bin/env bash
set -e

# 简化版 iOS 构建脚本
# 执行 eas build -p ios --profile production

echo "�� 开始 iOS Production 构建..."

# 检查 eas-cli
if ! command -v eas >/dev/null 2>&1; then
    echo "❌ 请先安装 eas-cli: npm i -g eas-cli"
    exit 1
fi

# 检查是否在 macOS 上运行
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ iOS 构建需要在 macOS 系统上运行"
    exit 1
fi

# 创建目录
mkdir -p ./builds

# 执行 EAS 构建
echo "📦 执行 EAS 构建..."
eas build -p ios --profile production --non-interactive --clear-cache

# 下载构建产物
echo "⬇️  下载构建产物..."
eas build:download --latest --output ./builds

# 找到 IPA 文件
IPA_FILE=$(ls -t ./builds/*.ipa 2>/dev/null | head -n 1)
if [ -z "$IPA_FILE" ]; then
    echo "❌ 未找到 IPA 文件"
    exit 1
fi

echo "📱 找到 IPA 文件: $IPA_FILE"

echo "✅ 构建完成！"
echo "�� IPA 文件: $IPA_FILE"
ls -lh "$IPA_FILE"

echo ""
echo "📋 后续步骤："
echo "1. 使用 Xcode 或 Application Loader 上传到 App Store Connect"
echo "2. 或使用 TestFlight 进行内测分发"
echo "3. 或使用 Ad Hoc 分发进行内部测试"
