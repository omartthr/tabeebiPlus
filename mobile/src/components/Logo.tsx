import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  variant?: 'light' | 'dark'; // 'light' means light background (so text is dark), 'dark' means dark background (text is white)
  showText?: boolean;
}

export default function Logo({ width = 160, height = 45, variant = 'light', showText = true }: LogoProps) {
  // Use the Python-processed transparent images
  const imageSource = variant === 'dark' 
    ? require('../../assets/images/logo_dark.png')
    : require('../../assets/images/logo_light.png');

  return (
    <View style={[styles.container, { width, height }]}>
      <Image 
        source={imageSource}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  }
});
