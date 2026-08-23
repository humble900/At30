import React, { useEffect } from 'react';
import { Compass, LogOut, ShieldCheck, X } from 'lucide-react';
import type { BrandKey, DiscoveredCoupon } from '../types';
import { soundEngine } from '../utils/audio';
import './ModalUI.css';

interface ExitModalProps { visitorName:string; discoveredCodes:Record<BrandKey,DiscoveredCoupon|null>; onConfirmExit:()=>void; onCancel:()=>void }

export const ExitModal:React.FC<ExitModalProps>=({visitorName,discoveredCodes,onConfirmExit,onCancel})=>{
  const totalUnlocked=Object.values(discoveredCodes).filter(Boolean).length;
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>event.key==='Escape'&&onCancel();window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onCancel]);
  const cancel=()=>{soundEngine.playClick();onCancel()};
  const confirm=()=>{soundEngine.playClick();onConfirmExit()};
  return <div className="museum-modal-backdrop animate-fade-in" onMouseDown={e=>e.target===e.currentTarget&&cancel()}>
    <section className="museum-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
      <header className="museum-modal__header"><div><p className="museum-modal__eyebrow">Leaving the museum</p><h2 id="exit-title">Return to the landing page?</h2></div><button className="museum-modal__close" onClick={cancel} aria-label="Close"><X size={20}/></button></header>
      <div className="museum-modal__body">
        <p className="museum-modal__copy">Your museum visit will pause here, {visitorName}. You can re-enter from the landing page with the same profile and continue where you left off.</p>
        <div className="museum-modal__summary"><div className="museum-modal__summary-row"><span>Rewards found</span><strong>{totalUnlocked} of 3</strong></div><div className="museum-progress" aria-label={`${totalUnlocked} of 3 rewards found`}><span style={{width:`${totalUnlocked/3*100}%`}}/></div><div className="museum-modal__note"><ShieldCheck size={16}/><span>Your profile and collected rewards are saved on this device.</span></div></div>
        <div className="museum-modal__actions"><button className="museum-button" onClick={cancel}><Compass size={17}/>Continue exploring</button><button className="museum-button museum-button--danger" onClick={confirm}><LogOut size={17}/>Return to landing page</button></div>
      </div>
    </section>
  </div>;
};
