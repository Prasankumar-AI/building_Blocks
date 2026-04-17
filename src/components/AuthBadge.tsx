import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { useStore } from '../store/useStore';

export const AuthBadge = () => {
  const setUserId = useStore((s) => s.setUserId);
  const loadWorld = useStore((s) => s.loadWorld);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>(
    isFirebaseConfigured ? 'connecting' : 'offline'
  );
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    // Demo mode — Firebase not configured
    if (!isFirebaseConfigured || !auth) {
      setStatus('offline');
      return;
    }

    signInAnonymously(auth).catch((err) => {
      console.error('[Auth] Anonymous sign-in failed:', err);
      setStatus('error');
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setUid(user.uid);
        setStatus('connected');
        await loadWorld();
      } else {
        setUserId(null);
        setStatus('error');
      }
    });

    return () => unsubscribe();
  }, [setUserId, loadWorld]);

  const shortUid = uid ? `…${uid.slice(-6)}` : null;

  const statusConfig = {
    connecting: { label: 'Connecting…', dot: '#f8c530' },
    connected:  { label: shortUid ? `🔒 ${shortUid}` : 'Connected', dot: '#7CFFD4' },
    error:      { label: '⚠️ Error', dot: '#f87171' },
    offline:    { label: '🌐 Demo Mode', dot: '#a78bfa' },
  };

  const cfg = statusConfig[status];

  return (
    <div
      className={`auth-badge auth-badge--${status === 'offline' ? 'connecting' : status}`}
      role="status"
      aria-label={`Firebase connection status: ${status}`}
      title={uid ? `User ID: ${uid}` : isFirebaseConfigured ? 'Connecting to Firebase...' : 'Running in demo mode — add Firebase credentials to enable cloud saves'}
    >
      <span
        className="auth-badge-dot"
        aria-hidden="true"
        style={{ background: cfg.dot }}
      />
      <span className="auth-badge-text">{cfg.label}</span>
    </div>
  );
};
