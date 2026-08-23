import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    }
    setBusy(false);
  }

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700 }}>Security Settings</h1>
        <p style={{ margin: 0, color: 'var(--admin-text-secondary)' }}>Manage your account security and authentication.</p>
      </header>

      <div style={{ maxWidth: '600px' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--admin-accent-cyan-dim)', padding: '10px', borderRadius: '8px', color: 'var(--admin-accent-cyan)' }}>
              <KeyRound size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Change Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '8px' }}>
                New Password
              </label>
              <input 
                type="password" 
                className="admin-input" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '8px' }}>
                Confirm New Password
              </label>
              <input 
                type="password" 
                className="admin-input" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>

            {message.text && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: message.type === 'error' ? 'rgba(255, 71, 87, 0.1)' : 'rgba(46, 213, 115, 0.1)',
                color: message.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                border: `1px solid ${message.type === 'error' ? 'rgba(255, 71, 87, 0.3)' : 'rgba(46, 213, 115, 0.3)'}`
              }}>
                <ShieldAlert size={16} />
                {message.text}
              </div>
            )}

            <div style={{ marginTop: '8px' }}>
              <button 
                type="submit" 
                className="admin-button admin-button-primary" 
                disabled={busy}
              >
                {busy ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
