import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { BarChart3, Building2, DoorOpen, LogOut, Menu, PanelLeftClose, ShieldCheck, X, Settings } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import DashboardPage from './pages/DashboardPage';
import BrandsPage from './pages/BrandsPage';
import ExhibitsPage from './pages/ExhibitsPage';
import SettingsPage from './pages/SettingsPage';

type AdminProfile = { full_name: string | null; email: string; role: string };

function Login({ onReady }: { onReady: (session: Session, profile: AdminProfile) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.session) { setError('Email or password is incorrect.'); setBusy(false); return; }
    const { data: profile, error: profileError } = await supabase.from('admin_users').select('full_name,email,role').eq('auth_user_id', data.user.id).single();
    if (profileError || !profile) { await supabase.auth.signOut(); setError('This account is not authorized for the admin portal.'); setBusy(false); return; }
    onReady(data.session, profile);
  }
  return <main className="login-shell"><section className="login-card">
    <div className="brand-mark">A<span>30</span></div><p className="eyebrow"><ShieldCheck size={15}/> Secure administration</p>
    <h1>Welcome back</h1><p className="muted">Sign in with an approved administrator account.</p>
    <form onSubmit={submit} className="form-stack">
      <label>Work email<input className="admin-input" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password<input className="admin-input" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      {error && <div className="notice error" role="alert">{error}</div>}
      <button className="admin-button admin-button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
    </form><p className="security-note">Access is logged. Contact the account owner if you need permissions.</p>
  </section></main>;
}

function Shell({ profile }: { profile: AdminProfile }) {
  const [open,setOpen]=useState(false);
  const links=[['/',BarChart3,'Overview'],['/brands',Building2,'Partners'],['/exhibits',DoorOpen,'Exhibits'],['/settings',Settings,'Settings']] as const;
  return <div className="app-shell"><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button>
    {open && <button className="nav-scrim" onClick={()=>setOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${open?'open':''}`}><div className="sidebar-head"><div className="brand-mark small">A<span>30</span></div><button className="icon-button mobile-only" onClick={()=>setOpen(false)}><X/></button></div>
      <div className="workspace-label"><span className="live-dot"/> Museum operations</div><nav>{links.map(([to,Icon,label])=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="sidebar-foot"><div className="account"><div className="avatar">{(profile.full_name||profile.email).slice(0,1).toUpperCase()}</div><div><strong>{profile.full_name||profile.email}</strong><span>{profile.role.replace('_',' ')}</span></div></div><button className="signout" onClick={()=>supabase.auth.signOut()}><LogOut size={17}/>Sign out</button></div>
    </aside><main className="main-content"><Routes><Route path="/" element={<DashboardPage/>}/><Route path="/brands" element={<BrandsPage/>}/><Route path="/exhibits" element={<ExhibitsPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></main></div>;
}

export default function App(){
  const [session,setSession]=useState<Session|null>(null); const [profile,setProfile]=useState<AdminProfile|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true; async function verify(next:Session|null){if(!next){if(active){setSession(null);setProfile(null);setLoading(false)}return} const {data}=await supabase.from('admin_users').select('full_name,email,role').eq('auth_user_id',next.user.id).single(); if(active){if(data){setSession(next);setProfile(data)}else{await supabase.auth.signOut();setSession(null);setProfile(null)}setLoading(false)}} supabase.auth.getSession().then(({data})=>verify(data.session)); const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>void verify(s)); return()=>{active=false;sub.subscription.unsubscribe()};},[]);
  if(loading)return <div className="boot-screen"><PanelLeftClose/>Verifying secure access…</div>;
  if(!session||!profile)return <Login onReady={(s,p)=>{setSession(s);setProfile(p)}}/>;
  return <Shell profile={profile}/>;
}
