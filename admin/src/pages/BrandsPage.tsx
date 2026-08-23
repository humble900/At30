import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2 } from 'lucide-react';

interface Brand {
  id: string;
  key: string;
  name: string;
  tagline: string;
  website_url: string;
  is_active: boolean;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('brands').select('id,key,name,tagline,website_url,is_active').order('sort_order').then(({data})=>{setBrands((data||[]) as Brand[]);setLoading(false)});
  }, []);

  async function toggle(brand:Brand){const {error}=await supabase.from('brands').update({is_active:!brand.is_active}).eq('id',brand.id);if(!error)setBrands(items=>items.map(item=>item.id===brand.id?{...item,is_active:!item.is_active}:item))}

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700 }}>Partners</h1>
          <p style={{ margin: 0, color: 'var(--admin-text-secondary)' }}>Configure participating companies and their rewards.</p>
        </div>
        <button className="admin-button admin-button-primary" disabled title="Partner creation requires the full onboarding form"><Plus size={18} /> Add partner</button>
      </header>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Loading brands...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brand Key</th>
                <th>Name</th>
                <th>Website</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--admin-accent-cyan)' }}>{brand.key}</td>
                  <td style={{ fontWeight: 600 }}>{brand.name}</td>
                  <td><span style={{ color:'var(--admin-text-secondary)',fontSize:'13px' }}>{brand.website_url}</span></td>
                  <td>
                    {brand.is_active 
                      ? <span className="admin-badge success">Active</span> 
                      : <span className="admin-badge neutral">Inactive</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button aria-label={`Toggle ${brand.name}`} onClick={()=>void toggle(brand)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', padding: '4px 8px' }}><Edit2 size={16} /></button>
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
