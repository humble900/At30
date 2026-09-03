import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Dices, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import './NameSelectModal.css';

interface NameSelectModalProps { initialName?: string; initialColor?: string; destination?: 'museum' | 'canopy'; onConfirm: (name: string, color: string) => void; onClose: () => void; }

const COLOR_OPTIONS = [
  { name: 'Cyan', color: '#00F0FF' }, { name: 'Amber', color: '#F59E0B' },
  { name: 'Purple', color: '#A855F7' }, { name: 'Emerald', color: '#10B981' },
  { name: 'Rose', color: '#F43F5E' }, { name: 'Silver', color: '#94A3B8' },
];
const CURATOR_NAMES = ['Curator Vance', 'Elena Rostova', 'Architect Kai', 'Dr. Soren Chen', 'Explorer Orion', 'Maya Sterling'];

export const NameSelectModal: React.FC<NameSelectModalProps> = ({ initialName = '', initialColor = '#00F0FF', destination = 'museum', onConfirm, onClose }) => {
  const [name, setName] = useState(initialName || 'Curator');
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const passNumber = useMemo(() => Math.abs(name.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 9000 + 1000), [name]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleRandomize = () => {
    soundEngine.playClick();
    setName(CURATOR_NAMES[Math.floor(Math.random() * CURATOR_NAMES.length)]);
    setSelectedColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].color);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('at30_visitor_name', name.trim());
    localStorage.setItem('at30_avatar_color', selectedColor);
    soundEngine.playCouponUnlock();
    onConfirm(name.trim(), selectedColor);
  };

  return (
    <div className="registration-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="registration-dialog" role="dialog" aria-modal="true" aria-labelledby="registration-title">
        <header className="registration-header">
          <div className="registration-heading"><div><small>BEFORE YOU ENTER</small><h2 id="registration-title">Review your avatar</h2><p>Continue with this profile or customize how other visitors see you.</p></div></div>
          <button className="registration-close" onClick={onClose} aria-label="Close visitor setup"><X size={20} /></button>
        </header>
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="visitor-preview">
            <span className="visitor-avatar" style={{ backgroundColor: selectedColor }}>{name.trim().charAt(0).toUpperCase() || 'A'}</span>
            <div><small>VISITOR {passNumber}</small><strong>{name.trim() || 'Museum visitor'}</strong><span>Saved on this device</span></div>
            <button type="button" onClick={handleRandomize}><Dices size={15} /> Surprise me</button>
          </div>
          <label className="registration-field"><span>Display name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={24} placeholder="Enter a name" /></label>
          <fieldset className="color-fieldset"><legend>Avatar color</legend><div className="color-grid">
            {COLOR_OPTIONS.map((option) => <button key={option.color} type="button" aria-pressed={selectedColor === option.color} onClick={() => setSelectedColor(option.color)}><span style={{ backgroundColor: option.color }} />{option.name}</button>)}
          </div></fieldset>
          <p className="registration-notice">By continuing, you agree to the <a href="/terms">Terms</a> and acknowledge the <a href="/privacy">Privacy Policy</a>, including museum interaction and position analytics.</p>
          <button className="registration-submit" type="submit" disabled={!name.trim()}>Continue to {destination === 'canopy' ? 'Canopy Run' : 'museum'} <ArrowRight size={18} /></button>
        </form>
      </section>
    </div>
  );
};
