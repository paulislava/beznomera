'use client';

import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_ELEMENT_ID = 'browser-qr-scanner-video';

interface Props {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function BrowserQrScanner({ onResult, onClose }: Props) {
  const resolvedRef = useRef(false);

  useEffect(() => {
    const el = document.getElementById(SCANNER_ELEMENT_ID);
    if (el) el.innerHTML = '';

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    let cancelled = false;

    const onDecoded = (text: string) => {
      if (cancelled || resolvedRef.current) return;
      resolvedRef.current = true;
      cancelled = true;
      scanner.stop().catch(() => {});
      onResult(text);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const startPromise = scanner
      .start({ facingMode: 'environment' }, config, onDecoded, undefined)
      .catch(() => scanner.start({ facingMode: 'user' }, config, onDecoded, undefined))
      .catch(() => {
        if (!cancelled) onClose();
      });

    return () => {
      cancelled = true;
      startPromise.then(() => {
        if (scanner.isScanning) scanner.stop().catch(() => {});
      }).catch(() => {});
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24
      }}
    >
      <p style={{ color: '#fff', fontSize: 14, opacity: 0.8 }}>Наведите камеру на QR-код</p>

      <div
        id={SCANNER_ELEMENT_ID}
        style={{ width: 280, height: 280, borderRadius: 16, overflow: 'hidden' }}
      />

      <button
        onClick={onClose}
        style={{
          marginTop: 8,
          padding: '10px 32px',
          borderRadius: 40,
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: 15,
          cursor: 'pointer'
        }}
      >
        Закрыть
      </button>
    </div>
  );
}
