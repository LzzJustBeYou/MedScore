const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加对 .tsx 和 .ts 文件的支持
config.resolver.sourceExts.push('tsx', 'ts');

// 完全禁用 web 平台
config.resolver.platforms = ['ios', 'android', 'native'];

// 添加 resolver 配置来忽略 web 相关模块
config.resolver.resolverMainFields = ['react-native', 'main'];
config.resolver.alias = {
  'expo-sqlite/web': false,
  'expo-sqlite/build/ExpoSQLite.web': false,
};

module.exports = config;
