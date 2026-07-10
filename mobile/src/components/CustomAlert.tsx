import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions
} from 'react-native';
import { colors, shadows } from '../theme';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Tamam',
  cancelText,
  type = 'info'
}: CustomAlertProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <X size={28} color={colors.red500} />;
      case 'warning': return <AlertTriangle size={28} color={colors.amber600} />;
      case 'success': return <CheckCircle2 size={28} color={colors.green500} />;
      default: return <Info size={28} color={colors.teal700} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger': return colors.red100;
      case 'warning': return colors.amber100;
      case 'success': return colors.green100;
      default: return colors.teal100;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        <Animated.View style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <View style={[styles.iconWrap, { backgroundColor: getIconBg() }]}>
            {getIcon()}
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[styles.actions, !cancelText && { justifyContent: 'center' }]}>
            {cancelText && (
              <TouchableOpacity 
                style={[styles.btn, styles.cancelBtn]} 
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[
                styles.btn, 
                styles.confirmBtn, 
                type === 'danger' && { backgroundColor: colors.red500 },
                type === 'success' && { backgroundColor: colors.green500 },
                !cancelText && { flex: 0, paddingHorizontal: 40 }
              ]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 31, 34, 0.4)',
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    ...shadows.float,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.ink900,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 14,
    color: colors.ink500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: colors.teal700,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cancelBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.ink100,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink700,
  },
});
