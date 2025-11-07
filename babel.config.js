module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // React Native Reanimated plugin harus di akhir
      "react-native-reanimated/plugin",
    ],
  };
};
