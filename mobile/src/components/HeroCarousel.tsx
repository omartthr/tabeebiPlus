/**
 * HeroCarousel — React Native adaptation of React Bits Carousel
 * Animated + PanResponder, no external deps.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Animated, PanResponder, View, StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const HP = 20;
const CARD_W = SCREEN_W - HP * 2;

interface HeroCarouselProps {
  items: React.ReactNode[];
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  height?: number;
}

export default function HeroCarousel({
  items,
  autoplay = true,
  autoplayDelay = 4000,
  loop = true,
  height = 200,
}: HeroCarouselProps) {
  const count = items.length;

  // For seamless loop, clone last item before and first item after
  const slides = loop && count > 1
    ? [items[count - 1], ...items, items[0]]
    : items;
  const totalSlides = slides.length;

  const startIdx = loop && count > 1 ? 1 : 0;
  const indexRef = useRef(startIdx);
  const [dotIndex, setDotIndex] = useState(0);

  const translateX = useRef(new Animated.Value(-startIdx * CARD_W)).current;
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnimating = useRef(false);
  const isDragging = useRef(false);

  // ── Go to a slide index with spring animation ────────────────────────────────
  const goTo = useCallback((toIdx: number, instant = false) => {
    const clamped = Math.max(0, Math.min(toIdx, totalSlides - 1));
    indexRef.current = clamped;

    // Update dots (real index without clone offset)
    const realIdx = loop && count > 1
      ? ((clamped - 1 + count) % count)
      : Math.min(clamped, count - 1);
    setDotIndex(realIdx);

    if (instant) {
      translateX.setValue(-clamped * CARD_W);
      return;
    }

    isAnimating.current = true;
    Animated.spring(translateX, {
      toValue: -clamped * CARD_W,
      useNativeDriver: true,
      speed: 14,
      bounciness: 2,
    }).start(({ finished }) => {
      if (!finished) { isAnimating.current = false; return; }
      isAnimating.current = false;

      if (!loop || count <= 1) return;
      // Loop jump: if landed on clone, instantly jump to real slide
      if (clamped === totalSlides - 1) {
        indexRef.current = 1;
        translateX.setValue(-1 * CARD_W);
        setDotIndex(0);
      } else if (clamped === 0) {
        indexRef.current = count;
        translateX.setValue(-count * CARD_W);
        setDotIndex(count - 1);
      }
    });
  }, [count, loop, totalSlides, translateX]);

  // ── Autoplay ─────────────────────────────────────────────────────────────────
  const startAutoplay = useCallback(() => {
    if (!autoplay || count <= 1) return;
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!isDragging.current) {
        goTo(indexRef.current + 1);
      }
    }, autoplayDelay);
  }, [autoplay, autoplayDelay, count, goTo]);

  useEffect(() => {
    startAutoplay();
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [startAutoplay]);

  // ── PanResponder ─────────────────────────────────────────────────────────────
  const dragStartX = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderGrant: () => {
        isDragging.current = true;
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        translateX.stopAnimation();
        // snapshot current offset
        dragStartX.current = -indexRef.current * CARD_W;
      },
      onPanResponderMove: (_, g) => {
        translateX.setValue(dragStartX.current + g.dx);
      },
      onPanResponderRelease: (_, g) => {
        isDragging.current = false;
        const threshold = CARD_W * 0.25;
        let next = indexRef.current;
        if (g.dx < -threshold || g.vx < -0.4) next += 1;
        else if (g.dx > threshold || g.vx > 0.4) next -= 1;
        next = Math.max(0, Math.min(next, totalSlides - 1));
        goTo(next);
        startAutoplay();
      },
      onPanResponderTerminate: (_, g) => {
        isDragging.current = false;
        goTo(indexRef.current);
        startAutoplay();
      },
    })
  ).current;

  return (
    <View style={{ marginHorizontal: HP, marginBottom: 20 }}>
      {/* Shadow wrapper (separate from overflow:hidden so shadow is visible) */}
      <View style={[styles.shadow, { height, width: CARD_W }]}>
        {/* Clip wrapper */}
        <View style={[styles.clip, { height, width: CARD_W }]}>
          <Animated.View
            style={[styles.track, { transform: [{ translateX }] }]}
            {...panResponder.panHandlers}
          >
            {slides.map((slide, i) => (
              <View key={i} style={{ width: CARD_W, height, flexShrink: 0, overflow: 'hidden' }}>
                {slide}
              </View>
            ))}
          </Animated.View>
        </View>
      </View>

      {/* Dot indicators */}
      {count > 1 && (
        <View style={styles.dots}>
          {Array.from({ length: count }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === dotIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#0D7377',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
      },
      android: { elevation: 8 },
    }),
  },
  clip: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#0D7377',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(13,115,119,0.3)',
  },
});
