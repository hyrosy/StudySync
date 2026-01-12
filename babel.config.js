module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Reanimated plugin must be last. 
      // In Reanimated v4, this plugin handles the worklets automatically.
      "react-native-reanimated/plugin",
    ],
  };
};