import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { RTLProvider, useRTL } from './src/context/RTLContext';
import SplashScreen from './src/screens/SplashScreen';
import './src/i18n';

/**
 * Inner wrapper that reads RTL state and applies the global
 * `direction` style. React Native propagates this to ALL children:
 * flex direction, textAlign, marginStart/End, padding etc.
 */
function RTLWrapper({ children }: { children: React.ReactNode }) {
  const { isRTL } = useRTL();
  return (
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      {children}
    </View>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <RTLProvider>
      <SafeAreaProvider>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <RTLWrapper>
          <AppNavigator />
        </RTLWrapper>
      </SafeAreaProvider>
    </RTLProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
