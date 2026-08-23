import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import './ModalUI.css';

export const ControlsOverlay:React.FC<{onClose:()=>void}>=({onClose})=>{
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>event.key==='Escape'&&onClose();window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
  const close=()=>{soundEngine.playClick();onClose()};
  return <div className="museum-modal-backdrop animate-fade-in">
    <section className="museum-modal" role="dialog" aria-modal="true" aria-labelledby="controls-title">
      <header className="museum-modal__header"><div><p className="museum-modal__eyebrow">Visitor guide</p><h2 id="controls-title">How to explore</h2></div><button className="museum-modal__close" onClick={close} aria-label="Close guide"><X size={20}/></button></header>
      <div className="museum-modal__body">
        <section className="control-section"><h3>Computer</h3><div className="control-list"><div className="control-row"><span>Move</span><kbd>W A S D</kbd></div><div className="control-row"><span>Look around</span><kbd>DRAG</kbd></div><div className="control-row"><span>Inspect</span><kbd>E</kbd></div><div className="control-row"><span>Run</span><kbd>SHIFT</kbd></div></div></section>
        <section className="control-section"><h3>Phone or tablet</h3><p>Move with your left thumb. Drag anywhere on the right side to look around. Action buttons appear near your right thumb when they are available.</p></section>
        <section className="control-section"><h3>Your visit</h3><p>Explore the east, north, and west wings. Inspect the featured exhibit in each wing to add its reward to your passport.</p></section>
        <button className="museum-button museum-button--primary" onClick={close}>Continue</button>
      </div>
    </section>
  </div>;
};
