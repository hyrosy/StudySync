module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // 1. Force transformation of import.meta to avoid web crashes
      "transform-import-meta",
      
      // 2. Reanimated plugin must always be LAST
      "react-native-reanimated/plugin",
    ],
  };
};