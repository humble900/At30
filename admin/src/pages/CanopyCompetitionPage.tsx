import { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  Trophy,
  UserCheck,
  UserX
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PrizeTier {
  id: string;
  position: number;
  amount_usd: number;
  label: string;
  sponsor_product: string;
  state: 'available' | 'held' | 'pending_review' | 'approved' | 'rejected' | 'delivered';
  claimed_at: string | null;
}

interface PrizeClaim {
  id: string;
  prize_position: number;
  prize_amount_usd: number;
  email_ciphertext: string;
  status: 'held' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'disqualified' | 'delivered';
  submitted_at: string;
  review_reason: string | null;
  run_id: string;
  user_id: string;
  runs?: {
    display_name: string;
    duration_ms: number;
    recoveries_count: number;
    route_choice: string;
  };
}

export default function CanopyCompetitionPage() {
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>([]);
  const [claims, setClaims] = useState<PrizeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [rejectionModalClaim, setRejectionModalClaim] = useState<PrizeClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Prize Tiers
      const { data: tiersData } = await supabase
        .from('competition_prize_tiers')
        .select('*')
        .order('position', { ascending: true });

      setPrizeTiers(tiersData || []);

      // 2. Fetch Claims with Run info
      const { data: claimsData } = await supabase
        .from('prize_claims')
        .select('*, runs:competition_runs(display_name, duration_ms, recoveries_count, route_choice)')
        .order('submitted_at', { ascending: false });

      setClaims(claimsData || []);
    } catch (err) {
      console.error('Failed to load Canopy admin data:', err);
    }
    setLoading(false);
  };

  const handleApproveClaim = async (claimId: string, position: number) => {
    setActionBusy(claimId);
    try {
      // Update claim status
      await supabase
        .from('prize_claims')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', claimId);

      // Update tier status
      await supabase
        .from('competition_prize_tiers')
        .update({ state: 'approved' })
        .eq('position', position);

      setNotice({ text: `Claim #${position} approved successfully.`, type: 'success' });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setNotice({ text: `Error: ${msg}`, type: 'error' });
    }
    setActionBusy(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalClaim) return;
    const claim = rejectionModalClaim;
    setActionBusy(claim.id);

    try {
      await supabase
        .from('prize_claims')
        .update({
          status: 'rejected',
          review_reason: rejectionReason || 'Failed offline LeadMagic account eligibility verification.',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Free up the tier for promotion
      await supabase
        .from('competition_prize_tiers')
        .update({ state: 'available' })
        .eq('position', claim.prize_position);

      setNotice({ text: `Claim #${claim.prize_position} rejected. Position is now available for the next runner.`, type: 'success' });
      setRejectionModalClaim(null);
      setRejectionReason('');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setNotice({ text: `Error: ${msg}`, type: 'error' });
    }
    setActionBusy(null);
  };

  const exportLeadMagicCSV = () => {
    if (claims.length === 0) {
      alert('No claims to export.');
      return;
    }

    const headers = [
      'Claim ID',
      'Prize Position',
      'Prize Amount USD',
      'LeadMagic Email Ciphertext',
      'Status',
      'Player Name',
      'Finish Duration (ms)',
      'Submission Timestamp',
      'Review Reason'
    ];

    const rows = claims.map((c) => [
      c.id,
      c.prize_position,
      c.prize_amount_usd,
      c.email_ciphertext.replace('ENC:', ''),
      c.status,
      c.runs?.display_name || 'Anonymous',
      c.runs?.duration_ms || 0,
      c.submitted_at,
      `"${c.review_reason || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeadMagic_Canopy_Claims_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--canopy-gold, #F59E0B)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Experience 002 Operations
          </span>
          <h1 style={{ margin: '4px 0 8px 0', fontSize: '28px', fontWeight: 800 }}>
            Canopy Run: Competition & Prize Claims
          </h1>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>
            Review provisional LeadMagic prize claims, inspect run validation traces, and export offline verification reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={exportLeadMagicCSV}
            className="admin-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#059669', color: '#FFF' }}
          >
            <FileSpreadsheet size={16} />
            <span>Export LeadMagic CSV</span>
          </button>
          <button
            onClick={loadData}
            className="admin-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '24px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: notice.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: notice.type === 'success' ? '#10B981' : '#EF4444',
          border: `1px solid ${notice.type === 'success' ? '#10B981' : '#EF4444'}`
        }}>
          {notice.text}
        </div>
      )}

      {/* Prize Ladder Status Cards */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#CBD5E1' }}>
        Active Prize Ladder Status ($2,000 Total Value)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '36px' }}>
        {prizeTiers.map((tier) => (
          <div
            key={tier.id}
            style={{
              background: 'rgba(15, 23, 27, 0.85)',
              border: `1px solid ${tier.state === 'available' ? '#10B981' : tier.state === 'approved' ? '#38BDF8' : '#F59E0B'}`,
              borderRadius: '16px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>Position #{tier.position}</span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                background: tier.state === 'available' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: tier.state === 'available' ? '#10B981' : '#F59E0B'
              }}>
                {tier.state.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#FFF' }}>
              ${tier.amount_usd.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              {tier.sponsor_product}
            </div>
          </div>
        ))}
      </div>

      {/* Pending & Historical Claims Table */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#CBD5E1' }}>
        Provisional LeadMagic Prize Claims ({claims.length})
      </h2>

      <div style={{ background: 'rgba(15, 23, 27, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        {claims.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <Trophy size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>No prize claims submitted yet.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8' }}>
                <th style={{ padding: '14px 18px' }}>Tier</th>
                <th style={{ padding: '14px 18px' }}>Player</th>
                <th style={{ padding: '14px 18px' }}>Time / Route</th>
                <th style={{ padding: '14px 18px' }}>Submitted Email</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <strong style={{ color: 'var(--canopy-gold, #F59E0B)' }}>#{claim.prize_position}</strong>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>${claim.prize_amount_usd}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <strong>{claim.runs?.display_name || 'Anonymous'}</strong>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{new Date(claim.submitted_at).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {claim.runs?.duration_ms ? formatTime(claim.runs.duration_ms) : '--'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {claim.runs?.route_choice} · {claim.runs?.recoveries_count} falls
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace' }}>
                    {claim.email_ciphertext.replace('ENC:', '')}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      background: claim.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : claim.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: claim.status === 'approved' ? '#10B981' : claim.status === 'rejected' ? '#EF4444' : '#F59E0B'
                    }}>
                      {claim.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {claim.status === 'pending_review' ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleApproveClaim(claim.id, claim.prize_position)}
                          disabled={actionBusy === claim.id}
                          className="admin-button"
                          style={{ background: '#059669', color: '#FFF', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <UserCheck size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectionModalClaim(claim)}
                          disabled={actionBusy === claim.id}
                          className="admin-button"
                          style={{ background: '#DC2626', color: '#FFF', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <UserX size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {claim.review_reason || 'Reviewed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModalClaim && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #EF4444',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '480px',
            width: '100%'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#EF4444' }}>
              Reject Claim #{rejectionModalClaim.prize_position}
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px 0' }}>
              Rejecting this claim will free up the ${rejectionModalClaim.prize_amount_usd} LeadMagic credit tier for the next eligible runner.
            </p>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              Reason for Disqualification / Rejection
            </label>
            <input
              type="text"
              className="admin-input"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. LeadMagic work email account not found"
              style={{ width: '100%', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="admin-button"
                onClick={() => setRejectionModalClaim(null)}
              >
                Cancel
              </button>
              <button
                className="admin-button"
                style={{ background: '#DC2626', color: '#FFF' }}
                onClick={handleConfirmReject}
              >
                Confirm Rejection & Promote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
