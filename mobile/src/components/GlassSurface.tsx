import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassSurfaceProps {
  children: React.ReactNode;
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  borderRadius?: number;
  intensity?: number; // 0 to 100
  style?: ViewStyle;
  tint?: 'light' | 'dark' | 'default';
}

export default function GlassSurface({
  children,
  width = '100%',
  height = '100%',
  borderRadius = 20,
  intensity = 50,
  tint = 'light',
  style,
}: GlassSurfaceProps) {
  const isIOS = Platform.OS === 'ios';

  const containerStyle: ViewStyle = {
    flex: 1,
    width: typeof width === 'number' ? width : '100%',
    height: typeof height === 'number' ? height : '100%',
    borderRadius,
    overflow: 'hidden',
  };

  const content = (
    <View style={[styles.content, { borderRadius }]}>
      {/* Glossy top-left light reflection line */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
        }}
      />
      {children}
    </View>
  );

  const outerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
  };

  return (
    <View
      style={[
        styles.container,
        outerStyle,
        style,
      ]}
    >
      {isIOS ? (
        <BlurView
          intensity={intensity}
          tint={tint === 'default' ? 'default' : tint}
          style={containerStyle}
        >
          {content}
        </BlurView>
      ) : (
        // Android fallback: uses slightly higher opacity background tint
        <View
          style={[
            containerStyle,
            {
              backgroundColor: tint === 'dark' 
                ? 'rgba(13, 74, 70, 0.85)' 
                : 'rgba(255, 255, 255, 0.8)',
            },
          ]}
        >
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Glass borders and subtle shadow
    borderWidth: 1,
    borderColor: 'rgba(153, 225, 217, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#1a7a73',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
