const path = require('path');

function dep(root, name, android) {
  return {
    root,
    name,
    platforms: {
      android: {
        sourceDir: android.sourceDir,
        packageImportPath: android.packageImportPath,
        packageInstance: android.packageInstance,
        buildTypes: [],
        libraryName: android.libraryName || null,
        componentDescriptors: android.componentDescriptors || [],
        cmakeListsPath: android.cmakeListsPath || null,
        dependencyConfiguration: android.dependencyConfiguration || null,
        isPureCxxDependency: false,
      },
    },
  };
}

function getConfig() {
  const root = process.cwd();
  const nm = path.join(root, 'node_modules');

  return {
    reactNativeVersion: '0.81.5',
    project: {
      android: {
        sourceDir: path.join(root, 'android'),
        appName: 'app',
        packageName: 'com.aibaby.assistant',
        applicationId: 'com.aibaby.assistant',
        mainActivity: '.MainActivity',
        watchModeCommandParams: null,
        dependencyConfiguration: null,
      },
    },
    dependencies: {
      '@react-native-async-storage/async-storage': dep(
        path.join(nm, '@react-native-async-storage', 'async-storage'),
        '@react-native-async-storage/async-storage',
        {
          sourceDir: path.join(nm, '@react-native-async-storage', 'async-storage', 'android'),
          packageImportPath: 'import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;',
          packageInstance: 'new AsyncStoragePackage()',
        }
      ),
      'react-native-safe-area-context': dep(
        path.join(nm, 'react-native-safe-area-context'),
        'react-native-safe-area-context',
        {
          sourceDir: path.join(nm, 'react-native-safe-area-context', 'android'),
          packageImportPath: 'import com.th3rdwave.safeareacontext.SafeAreaContextPackage;',
          packageInstance: 'new SafeAreaContextPackage()',
          libraryName: 'safeareacontext',
          componentDescriptors: [
            'RNCSafeAreaProviderComponentDescriptor',
            'RNCSafeAreaViewComponentDescriptor',
          ],
          cmakeListsPath: path.join(nm, 'react-native-safe-area-context', 'android', 'src', 'main', 'jni', 'CMakeLists.txt'),
        }
      ),
      'react-native-screens': dep(
        path.join(nm, 'react-native-screens'),
        'react-native-screens',
        {
          sourceDir: path.join(nm, 'react-native-screens', 'android'),
          packageImportPath: 'import com.swmansion.rnscreens.RNScreensPackage;',
          packageInstance: 'new RNScreensPackage()',
          libraryName: 'rnscreens',
          componentDescriptors: [
            'RNSFullWindowOverlayComponentDescriptor',
            'RNSScreenContainerComponentDescriptor',
            'RNSScreenNavigationContainerComponentDescriptor',
            'RNSScreenStackHeaderConfigComponentDescriptor',
            'RNSScreenStackHeaderSubviewComponentDescriptor',
            'RNSScreenStackComponentDescriptor',
            'RNSSearchBarComponentDescriptor',
            'RNSScreenComponentDescriptor',
            'RNSScreenFooterComponentDescriptor',
            'RNSScreenContentWrapperComponentDescriptor',
            'RNSModalScreenComponentDescriptor',
            'RNSBottomTabsComponentDescriptor',
          ],
          cmakeListsPath: path.join(nm, 'react-native-screens', 'android', 'src', 'main', 'jni', 'CMakeLists.txt'),
        }
      ),
    },
    commands: [],
  };
}

function run() {
  const command = process.argv[2];
  if (command === 'config') {
    process.stdout.write(JSON.stringify(getConfig()));
    return;
  }

  process.stderr.write(`Unsupported local React Native CLI command: ${command || ''}\n`);
  process.exitCode = 1;
}

module.exports = { run };

if (require.main === module) {
  run();
}
