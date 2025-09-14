const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加对 .tsx 和 .ts 文件的支持
config.resolver.sourceExts.push('tsx', 'ts');

module.exports = config;
