import React from 'react';
import { IX, IAlert } from './icons';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, onClose }: Props) {
  if (!visible) return null;
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--red-100)', color: 'var(--red-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <IAlert size={32} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>{message}</p>
        <button 
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', height: 48 }}
        >
          Tamam
        </button>
      </div>
    </div>
  );
}
