const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// Only add workspace root if we're actually in a monorepo dev environment
// (not on EAS build server where the parent dir structure is different)
const parentPkgPath = path.resolve(workspaceRoot, 'package.json');
if (fs.existsSync(parentPkgPath)) {
  try {
    const parentPkg = JSON.parse(fs.readFileSync(parentPkgPath, 'utf8'));
    if (parentPkg.workspaces) {
      config.watchFolders = [workspaceRoot];
      config.resolver.nodeModulesPaths = [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(workspaceRoot, 'node_modules'),
      ];
    }
  } catch (e) {
    // Ignore - just use default config
  }
}

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
