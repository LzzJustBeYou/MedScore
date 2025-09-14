module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 如果需要，可以添加其他插件
    ],
  };
};
