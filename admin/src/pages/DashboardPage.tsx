import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, ExternalLink, Eye, Key, Monitor, RefreshCw, TicketCheck, Tv, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '../lib/supabase';

type Visit = {
  id: string;
  started_at: string;
  ended_at: string | null;
  session_duration_seconds: number;
  device_type: string;
  avg_fps: number;
  completed_quest: boolean;
  exhibits_inspected?: string[];
};

type Event = {
  event_type: string;
  timestamp: string;
  brand_key: string | null;
  exhibit_id: string | null;
  payload?: {
    title?: string;
    durationSeconds?: number;
    couponCode?: string;
    redeemUrl?: string;
    [key: string]: unknown;
  } | null;
};

const dayKey = (v: string) => new Date(v).toISOString().slice(0, 10);
const duration = (seconds: number) => seconds < 60 ? `${Math.round(seconds)}s` : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;

interface ExhibitInfo {
  id: string;
  title: string;
  type: string;
}

interface BrandConfig {
  key: string;
  name: string;
  category: string;
  wing: string;
  accent: string;
  icon: typeof Tv;
  exhibits: ExhibitInfo[];
}

const BRANDS: BrandConfig[] = [
  {
    key: 'ripplepos',
    name: 'RipplePOS',
    category: 'Point of Sale & Smart Menus',
    wing: 'East Wing · Digital Canvas Wing',
    accent: '#38bdf8',
    icon: Tv,
    exhibits: [
      { id: 'ripplepos-master', title: 'The Master 8K Digital Canvas', type: 'Signage Screen' },
      { id: 'ripplepos-menu', title: 'Smart Digital Menu Wall', type: 'Menu Display' },
    ]
  },
  {
    key: 'clayrent',
    name: 'ClayRent',
    category: 'Modern Living & Smart Leases',
    wing: 'North Wing · Modern Habitat Pavilion',
    accent: '#fbbf24',
    icon: Key,
    exhibits: [
      { id: 'clayrent-master', title: 'Architectural Villa Blueprints', type: '3D Pedestal' },
      { id: 'clayrent-mobility', title: 'The Modern Mobility Showcase', type: 'Gallery Print' },
    ]
  },
  {
    key: 'filedcrews',
    name: 'FiledCrews',
    category: 'Field Operations & Crew Management',
    wing: 'West Wing · Field Operations Vault',
    accent: '#c084fc',
    icon: Monitor,
    exhibits: [
      { id: 'filedcrews-master', title: 'Field Operations Command Crystal', type: 'Command Crystal' },
      { id: 'filedcrews-dispatch', title: 'The Workforce Dispatch Matrix', type: 'Dispatch Glass' },
    ]
  }
];

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const since = new Date(Date.now() - days * 864e5).toISOString();
    const [v, e] = await Promise.all([
      supabase.from('visitor_sessions')
        .select('id,started_at,ended_at,session_duration_seconds,device_type,avg_fps,completed_quest,exhibits_inspected')
        .gte('started_at', since)
        .order('started_at'),
      supabase.from('telemetry_events')
        .select('event_type,timestamp,brand_key,exhibit_id,payload')
        .gte('timestamp', since)
        .order('timestamp')
    ]);

    if (v.error || e.error) {
      setError(v.error?.message || e.error?.message || 'Analytics could not be loaded.');
    } else {
      setVisits((v.data || []) as Visit[]);
      setEvents((e.data || []) as Event[]);
      setUpdated(new Date());
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const analytics = useMemo(() => {
    const ended = visits.filter(v => v.ended_at || v.session_duration_seconds > 0);
    const avg = ended.length ? ended.reduce((a, v) => a + Number(v.session_duration_seconds || 0), 0) / ended.length : 0;
    const active = visits.filter(v => !v.ended_at && Date.now() - new Date(v.started_at).getTime() < 15 * 60e3).length;
    const inspect = events.filter(e => e.event_type === 'exhibit_inspect_opened').length;
    const coupons = events.filter(e => e.event_type === 'coupon_code_copied').length;
    const outbound = events.filter(e => e.event_type === 'brand_outbound_clicked').length;

    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 864e5).toISOString().slice(0, 10);
      return {
        date: d,
        label: new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        sessions: visits.filter(v => dayKey(v.started_at) === d).length,
        inspections: events.filter(e => e.event_type === 'exhibit_inspect_opened' && dayKey(e.timestamp) === d).length
      };
    });

    const devices = Object.entries(visits.reduce<Record<string, number>>((a, v) => {
      a[v.device_type || 'unknown'] = (a[v.device_type || 'unknown'] || 0) + 1;
      return a;
    }, {})).map(([name, value]) => ({ name, value }));

    // Per-brand calculations
    const brandMetrics = BRANDS.map(brand => {
      const isBrandMatch = (k: string | null | undefined) => {
        if (!k) return false;
        return k === brand.key;
      };

      const brandInspectEvents = events.filter(e => isBrandMatch(e.brand_key) && e.event_type === 'exhibit_inspect_opened');
      const totalOpens = brandInspectEvents.length;

      // Unique visitors whose session includes this brand's exhibits
      const uniqueVisitors = visits.filter(v =>
        Array.isArray(v.exhibits_inspected) && v.exhibits_inspected.some(id => id.startsWith(brand.key))
      ).length;

      // Dwell time on exhibit
      const durationEvents = events.filter(e => isBrandMatch(e.brand_key) && e.event_type === 'exhibit_inspect_duration');
      const totalDuration = durationEvents.reduce((acc, e) => acc + Number(e.payload?.durationSeconds || 0), 0);
      const avgDwell = durationEvents.length ? Math.round(totalDuration / durationEvents.length) : 0;

      const brandCoupons = events.filter(e => isBrandMatch(e.brand_key) && e.event_type === 'coupon_code_copied').length;
      const brandOutbound = events.filter(e => isBrandMatch(e.brand_key) && e.event_type === 'brand_outbound_clicked').length;

      const exhibitBreakdown = brand.exhibits.map(ex => {
        const opens = brandInspectEvents.filter(e => e.exhibit_id === ex.id).length;
        return {
          ...ex,
          opens
        };
      });

      return {
        ...brand,
        totalOpens,
        uniqueVisitors,
        avgDwell,
        coupons: brandCoupons,
        outbound: brandOutbound,
        exhibitBreakdown
      };
    });

    const brandChartData = brandMetrics.map(b => ({
      name: b.name,
      opens: b.totalOpens,
      visitors: b.uniqueVisitors,
      fill: b.accent
    }));

    return { avg, active, inspect, coupons, outbound, dates, devices, brandMetrics, brandChartData };
  }, [visits, events, days]);

  const cards = [
    [Users, 'Sessions', visits.length, 'Visits started in period'],
    [Activity, 'Active now', analytics.active, 'Seen in the last 15 minutes'],
    [Clock3, 'Average visit', duration(analytics.avg), 'Completed or measured visits'],
    [Eye, 'Artwork inspections', analytics.inspect, 'Total inspect panels opened'],
    [TicketCheck, 'Rewards copied', analytics.coupons, `${analytics.outbound} partner site visits`]
  ] as const;

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations intelligence</p>
          <h1>Museum overview</h1>
          <p className="muted">Live, privacy-conscious visitor, exhibit, and brand signage analytics.</p>
        </div>
        <div className="header-actions">
          <select
            className="admin-input compact"
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            aria-label="Date range"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            className="admin-button admin-button-secondary"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {error && <div className="notice error">Unable to load live analytics. {error}</div>}

      <div className="status-row">
        <span><span className="live-dot" />Live Supabase data</span>
        <span>{updated ? `Updated ${updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Connecting…'}</span>
      </div>

      <section className="metric-grid">
        {cards.map(([Icon, label, value, note]) => (
          <article className="metric-card" key={label}>
            <div className="metric-icon"><Icon size={19} /></div>
            <div>
              <span>{label}</span>
              <strong>{loading ? '—' : value}</strong>
              <small>{note}</small>
            </div>
          </article>
        ))}
      </section>

      {/* ============================================================ */}
      {/* BRAND & DIGITAL SIGNAGE BREAKDOWN                            */}
      {/* ============================================================ */}
      <section style={{ marginTop: '20px' }}>
        <article className="admin-card">
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tv size={18} style={{ color: 'var(--accent)' }} />
                <h2>Partner & Digital Signage Engagement</h2>
              </div>
              <p>Per-brand breakdown of signage screen inspections, unique visitors, viewing dwell time, and outbound clicks.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="admin-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-dot" style={{ margin: 0 }} /> Tracking Active
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Partner & Signage Wing</th>
                  <th>Screens & Displays</th>
                  <th style={{ textAlign: 'right' }}>Signage Opens</th>
                  <th style={{ textAlign: 'right' }}>Unique Visitors</th>
                  <th style={{ textAlign: 'right' }}>Avg View Dwell</th>
                  <th style={{ textAlign: 'right' }}>Vouchers Copied</th>
                  <th style={{ textAlign: 'right' }}>Outbound CTR</th>
                </tr>
              </thead>
              <tbody>
                {analytics.brandMetrics.map(brand => {
                  const Icon = brand.icon;
                  return (
                    <tr key={brand.key} style={{ verticalAlign: 'top' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.05)',
                              border: `1px solid ${brand.accent}40`,
                              display: 'grid',
                              placeItems: 'center',
                              color: brand.accent,
                              flexShrink: 0
                            }}
                          >
                            <Icon size={16} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {brand.name}
                              {brand.key === 'ripplepos' && (
                                <span style={{ fontSize: '10px', background: '#38bdf825', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  POS & Signage
                                </span>
                              )}
                            </strong>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                              {brand.category}
                            </div>
                            <div style={{ fontSize: '10px', color: brand.accent, marginTop: '2px' }}>
                              {brand.wing}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {brand.exhibitBreakdown.map(ex => (
                            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '3px 8px', borderRadius: '6px' }}>
                              <span style={{ color: '#cbd5e1' }}>{ex.title}</span>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: brand.accent }}>
                                {loading ? '—' : `${ex.opens} opens`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px', color: '#fff' }}>
                        {loading ? '—' : brand.totalOpens.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>
                        {loading ? '—' : brand.uniqueVisitors.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: 'var(--muted)' }}>
                        {loading ? '—' : duration(brand.avgDwell)}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: '#fff' }}>
                        {loading ? '—' : brand.coupons.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: brand.outbound > 0 ? 'var(--accent)' : 'var(--muted)' }}>
                          {loading ? '—' : brand.outbound.toLocaleString()}
                          <ExternalLink size={12} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Analytics Charts Grid */}
      <section className="analytics-grid">
        <article className="admin-card chart-wide">
          <div className="card-heading">
            <div>
              <h2>Visitor activity</h2>
              <p>Sessions and exhibit inspections over time</p>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dates}>
                <defs>
                  <linearGradient id="traffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#78a9ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#78a9ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#252b35" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#87919f', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fill: '#87919f', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#15191f', border: '1px solid #303744', borderRadius: 10 }} />
                <Area type="monotone" dataKey="sessions" name="Visitor Sessions" stroke="#78a9ff" strokeWidth={2} fill="url(#traffic)" />
                <Area type="monotone" dataKey="inspections" name="Exhibit Opens" stroke="#b7f36b" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-card">
          <div className="card-heading">
            <div>
              <h2>Signage & Exhibit Opens by Brand</h2>
              <p>Relative distribution across partner pavilions</p>
            </div>
          </div>
          {analytics.brandChartData.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.brandChartData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis dataKey="name" type="category" width={95} tick={{ fill: '#aab2bd', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#15191f', border: '1px solid #303744', borderRadius: 10 }} />
                  <Bar dataKey="opens" name="Total Opens" fill="#38bdf8" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty />}
        </article>
      </section>

      {!loading && !visits.length && !events.length && (
        <div className="empty-panel">
          <Activity />
          <h2>No activity in this period</h2>
          <p>Real visitor sessions will appear here as people enter the museum. No sample data is used.</p>
        </div>
      )}
    </div>
  );
}

function Empty() {
  return <div className="empty-small">No data recorded yet</div>;
}
