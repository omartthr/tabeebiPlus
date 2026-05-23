import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, StatusBar, Animated } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const videoRef = useRef<Video>(null);
  const fadeOut = useRef(new Animated.Value(1)).current;
  const finishedRef = useRef(false);

  const triggerFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // Logo + "tabeebi+" tamamen oluştuktan sonra (~7s) geçiş yap
    if (status.positionMillis >= 7000 || status.didJustFinish) {
      triggerFinish();
    }
  };

  // Fallback: 9 saniye içinde video yüklenmezse veya bitmediyse geç
  useEffect(() => {
    const timeout = setTimeout(() => {
      triggerFinish();
    }, 9000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <Video
        ref={videoRef}
        source={require('../../assets/splash_animation.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        isMuted
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b9192',
  },
});
