const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// Fix semver sub-path imports that Metro can't resolve (needed by react-native-reanimated)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'semver/functions/satisfies') {
    return { filePath: path.resolve(projectRoot, 'stubs/semver-satisfies.js'), type: 'sourceFile' };
  }
  if (moduleName === 'semver/functions/prerelease') {
    return { filePath: path.resolve(projectRoot, 'stubs/semver-prerelease.js'), type: 'sourceFile' };
  }
  if (moduleName === 'semver/ranges/outside') {
    return { filePath: path.resolve(projectRoot, 'stubs/semver-outside.js'), type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/styles/global.css' });
