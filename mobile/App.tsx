import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
