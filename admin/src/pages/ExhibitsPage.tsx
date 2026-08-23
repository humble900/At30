import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2 } from 'lucide-react';

export default function ExhibitsPage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('exhibits').select('id,title,brand_key,type,is_active').order('sort_order').then(({data})=>{setExhibits(data||[]);setLoading(false)});
  }, []);
  async function toggle(exhibit:any){const {error}=await supabase.from('exhibits').update({is_active:!exhibit.is_active}).eq('id',exhibit.id);if(!error)setExhibits(items=>items.map(item=>item.id===exhibit.id?{...item,is_active:!item.is_active}:item))}

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700 }}>Manage Exhibits</h1>
          <p style={{ margin: 0, color: 'var(--admin-text-secondary)' }}>Configure 3D exhibits, models, and metadata.</p>
        </div>
        <button className="admin-button admin-button-primary">
          <Plus size={18} /> Add New Exhibit
        </button>
      </header>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Loading exhibits...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Exhibit Key</th>
                <th>Title</th>
                <th>Brand Parent</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exhibits.map(exhibit => (
                <tr key={exhibit.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--admin-accent-cyan)' }}>{exhibit.id}</td>
                  <td style={{ fontWeight: 600 }}>{exhibit.title}</td>
                  <td><span style={{ color: 'var(--admin-text-secondary)' }}>{exhibit.brand_key}</span></td>
                  <td>
                    {exhibit.is_active 
                      ? <span className="admin-badge success">Active</span> 
                      : <span className="admin-badge neutral">Inactive</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button aria-label={`Toggle ${exhibit.title}`} onClick={()=>void toggle(exhibit)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', padding: '4px 8px' }}><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
