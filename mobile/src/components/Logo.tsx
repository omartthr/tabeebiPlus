import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  variant?: 'light' | 'dark'; // 'light' means light background (so text is dark), 'dark' means dark background (text is white)
  showText?: boolean;
  style?: any;
}

export default function Logo({ width = 160, height = 45, variant = 'light', showText = true, style }: LogoProps) {
  // Use the Python-processed transparent images
  const imageSource = variant === 'dark' 
    ? require('../../assets/images/logo_dark.png')
    : require('../../assets/images/logo_light.png');

  if (!showText) {
    // Logo's aspect ratio is roughly 4.4
    // Scale down the inner image slightly to prevent subpixel clipping
    const innerHeight = height * 0.82;
    const fullWidth = innerHeight * 3.502; 
    const containerWidth = innerHeight * 0.8;
    const topOffset = (height - innerHeight) / 2;
    
    return (
      <View style={[{ width: containerWidth, height, overflow: 'hidden' }, style]}>
        <Image 
          source={imageSource}
          style={{ width: fullWidth, height: innerHeight, position: 'absolute', left: 0, top: topOffset }}
          resizeMode="stretch"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
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
