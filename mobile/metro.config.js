const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// Only add workspace root if we're actually in a monorepo dev environment
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
// and stub out OpenTelemetry modules that use dynamic import() incompatible with Hermes
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
  // Stub out OpenTelemetry - uses dynamic import() that Hermes cannot compile
  if (moduleName.startsWith('@opentelemetry/') || moduleName === '@opentelemetry/api') {
    return { filePath: path.resolve(projectRoot, 'stubs/otel-stub.js'), type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
