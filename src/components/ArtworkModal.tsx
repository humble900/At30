import React, { useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import type { MasterpieceArt } from '../data/artworks';
import { soundEngine } from '../utils/audio';
import './ModalUI.css';

export const ArtworkModal:React.FC<{artwork:MasterpieceArt;onClose:()=>void}>=({artwork,onClose})=>{
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>event.key==='Escape'&&onClose();window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
  const close=()=>{soundEngine.playClick();onClose()};
  return <div className="museum-modal-backdrop animate-fade-in" onMouseDown={event=>event.target===event.currentTarget&&close()}>
    <article className="museum-modal artwork-dialog" role="dialog" aria-modal="true" aria-labelledby="artwork-title">
      <header className="museum-modal__header"><div><p className="museum-modal__eyebrow">From the collection</p><h2 id="artwork-title">{artwork.title}</h2></div><button className="museum-modal__close" onClick={close} aria-label="Close artwork details"><X size={20}/></button></header>
      <div className="museum-modal__body">
        <img className="artwork-dialog__image" src={artwork.imageUrl} alt={artwork.title}/>
        <div className="artwork-dialog__credit"><div><span>Artist</span><strong>{artwork.artist}</strong></div><div><span>Date</span><strong>{artwork.year}</strong></div><div><span>Medium</span><strong>{artwork.medium}</strong></div></div>
        <section className="artwork-dialog__story"><h3>The story</h3><p>{artwork.description}</p></section>
        <p className="artwork-dialog__location"><MapPin size={15}/><span>{artwork.location}</span></p>
        <button className="museum-button museum-button--primary" onClick={close}>Continue exploring</button>
      </div>
    </article>
  </div>;
};
