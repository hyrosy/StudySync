const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 1. Ensure absolute path resolution for NativeWind
config.resolver.sourceExts.push('mjs');

// 2. Force CommonJS resolution to avoid ESM import.meta issues
config.resolver.mainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, { input: './global.css' });