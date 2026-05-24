module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Transform dynamic import() to require() for Hermes compatibility
    '@babel/plugin-transform-dynamic-import',
    // Reanimated plugin must be listed LAST
    'react-native-reanimated/plugin',
  ],
};
