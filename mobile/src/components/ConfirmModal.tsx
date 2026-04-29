import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { colors, shadows } from '../theme';
import { AlertCircle } from 'lucide-react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: type === 'danger' ? colors.red100 : colors.teal50 }]}>
            <AlertCircle 
              size={32} 
              color={type === 'danger' ? colors.red500 : colors.teal700} 
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmBtn, { backgroundColor: type === 'danger' ? colors.red500 : colors.teal700 }]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 34, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    ...shadows.float,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink900,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.ink500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 100,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink700,
  },
  confirmBtn: {
    flex: 1,
    height: 52,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
