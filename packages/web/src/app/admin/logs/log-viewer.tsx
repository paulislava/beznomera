'use client';

import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  time: number;
  message: string;
}

function getLevel(msg: string): 'error' | 'warn' | 'log' {
  const l = msg.toLowerCase();
  if (l.includes('error') || l.includes(' err ')) return 'error';
  if (l.includes('warn')) return 'warn';
  return 'log';
}

const COLORS: Record<ReturnType<typeof getLevel>, string> = {
  error: '#ff6b6b',
  warn: '#ffd93d',
  log: '#c9d1d9',
};

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const es = new EventSource('/api/logs/stream', { withCredentials: true });
    es.onmessage = (e: MessageEvent<string>) => {
      if (pausedRef.current) return;
      const entry = JSON.parse(e.data) as LogEntry;
      setLogs((prev) => [...prev.slice(-999), entry]);
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, paused]);

  return (
    <div
      style={{
        background: '#0d1117',
        minHeight: '100dvh',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          position: 'sticky',
          top: 0,
          background: '#0d1117',
          padding: '4px 0',
          zIndex: 1,
        }}
      >
        <span style={{ color: '#8b949e' }}>
          Logs ({logs.length})
        </span>
        <button
          onClick={() => setPaused((p) => !p)}
          style={{
            padding: '4px 12px',
            background: paused ? '#238636' : '#b62324',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div>
        {logs.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', lineHeight: '1.5', wordBreak: 'break-all' }}>
            <span style={{ color: '#484f58', flexShrink: 0 }}>
              {new Date(entry.time).toLocaleTimeString()}
            </span>
            <span style={{ color: COLORS[getLevel(entry.message)] }}>
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
