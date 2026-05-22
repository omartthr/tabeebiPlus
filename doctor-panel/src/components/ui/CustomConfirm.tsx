import React from 'react';
import { IAlert } from './icons';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomConfirm({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Evet, Onayla',
  cancelText = 'Vazgeç'
}: Props) {
  if (!visible) return null;
  return (
    <div className="alert-overlay">
      <div className="alert-card" style={{ maxWidth: 440 }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          borderRadius: 18, 
          background: 'var(--teal-50)', 
          color: 'var(--teal-700)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 24 
        }}>
          <IAlert size={32} color="currentColor" />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>{message}</p>
        
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button 
            onClick={onCancel}
            className="btn btn-outline"
            style={{ 
              flex: 1, 
              height: 48, 
              borderColor: 'var(--ink-200)', 
              color: 'var(--ink-600)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="btn btn-primary"
            style={{ 
              flex: 1, 
              height: 48, 
              backgroundColor: 'var(--teal-700)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
