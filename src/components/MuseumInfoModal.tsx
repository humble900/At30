import React, { useEffect } from 'react';
import { ArrowUpCircle, Eye, Gift, Move, X } from 'lucide-react';
import type { MuseumInfoPoint } from '../engine/MuseumScene';
import { soundEngine } from '../utils/audio';
import './ModalUI.css';

const WhatsAppIcon = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2.2 22l5.5-1.4A9.8 9.8 0 1 0 12 2Zm0 17.7a7.7 7.7 0 0 1-3.9-1.1l-.4-.2-3.2.8.9-3.1-.3-.5A7.7 7.7 0 1 1 12 19.7Zm4.2-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.8-.2-.3.2-.3.6-1.1.1-.2 0-.4 0-.5L9.6 8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1.2 2-.4 3.8 1 2.4 3 4.2 5.4 5.1 2 .7 3.3.5 4.1-.5.3-.4.5-1.2.4-1.5-.1-.4-.8-.6-1.1-.9Z"/></svg>;

export const MuseumInfoModal:React.FC<{point:MuseumInfoPoint;onClose:()=>void}>=({point,onClose})=>{
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>event.key==='Escape'&&onClose();window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
  const close=()=>{soundEngine.playClick();onClose()};
  const isGuide = point.kind === 'guide';
  const isArtifact = point.kind === 'artifact';

  return (
    <div className="museum-modal-backdrop animate-fade-in" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <section className="museum-modal" role="dialog" aria-modal="true" aria-labelledby="info-title">
        <header className="museum-modal__header">
          <div>
            <p className="museum-modal__eyebrow">
              {isGuide ? 'Visitor guide' : isArtifact ? 'Archival Collection' : 'Partnerships'}
            </p>
            <h2 id="info-title">{point.title}</h2>
          </div>
          <button className="museum-modal__close" onClick={close} aria-label="Close"><X size={20} /></button>
        </header>
        <div className="museum-modal__body">
          {isGuide ? (
            <>
              <p className="museum-modal__copy">Visit all three wings, inspect their featured exhibits, and collect the reward hidden in each gallery.</p>
              <div className="guide-steps">
                <div><Move /><span><strong>Explore</strong>Use the joystick or WASD to move. Drag the view to look around.</span></div>
                <div><Eye /><span><strong>Inspect</strong>Approach art or exhibits and select Inspect. Desktop players can press E.</span></div>
                <div><Gift /><span><strong>Collect</strong>Find three gallery rewards. They remain saved in your museum passport.</span></div>
                <div><ArrowUpCircle /><span><strong>Move freely</strong>Run, jump, talk to nearby visitors, or return to this book whenever you need help.</span></div>
              </div>
              <button className="museum-button museum-button--primary" onClick={close}>Start exploring</button>
            </>
          ) : isArtifact ? (
            <>
              <p className="museum-modal__copy">
                A high-fidelity 3D artifact curated permanently in the AT30 Museum Reception Hall.
              </p>
              <div className="museum-modal__summary">
                <div className="museum-modal__summary-row">
                  <span>Exhibition Wing</span>
                  <strong style={{ color: '#00F0FF' }}>Reception & South Foyer</strong>
                </div>
                <div className="museum-modal__summary-row">
                  <span>Medium</span>
                  <strong>High-Fidelity 3D Sculptural Mesh</strong>
                </div>
                <div className="museum-modal__summary-row">
                  <span>Accession</span>
                  <strong>AT30 Special Collections (2026)</strong>
                </div>
                <div className="museum-modal__note">
                  <span>This artifact serves as the reception greeting centerpiece, welcoming visitors to explore all galleries, solve clues, and discover secrets across the museum.</span>
                </div>
              </div>
              <button className="museum-button museum-button--primary" onClick={close}>Continue exploring</button>
            </>
          ) : (
            <>
              <p className="museum-modal__copy">Place your brand inside the AT30 Museum through reception media, an interactive exhibit, or a dedicated gallery partnership.</p>
              <div className="museum-modal__summary">
                <div className="museum-modal__summary-row"><span>Partnership contact</span><strong>+1 409 422 9714</strong></div>
                <div className="museum-modal__note"><span>Send a WhatsApp message to discuss advertising availability, campaign ideas, or a museum partnership.</span></div>
              </div>
              <a className="museum-button museum-button--whatsapp" href="https://wa.me/14094229714?text=Hello%20AT30%2C%20I%27m%20interested%20in%20advertising%20or%20a%20museum%20partnership." target="_blank" rel="noopener noreferrer"><WhatsAppIcon />Message AT30 on WhatsApp</a>
              <button className="museum-button" onClick={close}>Continue exploring</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
