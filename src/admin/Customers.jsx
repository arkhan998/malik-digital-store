import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/toast';
import { useAuth } from '../lib/auth';
import {
  Card, CenterLoading, PageHeader, Toggle,
  TableWrap, Th, Td, fmtDate,
} from './ui';

export default function Customers() {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, whatsapp, is_admin, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      toast(err.message || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdmin(p, value) {
    if (p.id === user?.id && !value) {
      if (!window.confirm('Remove admin rights from your own account? You will lose access to this panel.')) return;
    }
    const { error } = await supabase.from('profiles').update({ is_admin: value }).eq('id', p.id);
    if (error) {
      toast(error.message, 'error');
    } else {
      setProfiles((ps) => ps.map((x) => (x.id === p.id ? { ...x, is_admin: value } : x)));
      toast(`${p.email || 'Customer'} ${value ? 'is now an admin' : 'is no longer an admin'}`, 'success');
    }
  }

  if (loading) return <CenterLoading />;

  return (
    <div>
      <PageHeader
        title="Customers"
        sub={`${profiles.length} registered account${profiles.length === 1 ? '' : 's'} (guest checkouts don't appear here)`}
      />

      <Card>
        {profiles.length === 0 ? (
          <p className="text-sm text-white/50 py-8 text-center">No customer accounts yet.</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Email</Th>
                <Th>WhatsApp</Th>
                <Th>Joined</Th>
                <Th>Admin</Th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <Td className="max-w-[220px] truncate">
                    {p.email || '—'}
                    {p.id === user?.id && (
                      <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                        you
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">{p.whatsapp || '—'}</Td>
                  <Td className="text-white/50 whitespace-nowrap">{fmtDate(p.created_at)}</Td>
                  <Td>
                    <Toggle
                      checked={!!p.is_admin}
                      onChange={(v) => toggleAdmin(p, v)}
                      label={`Admin rights for ${p.email || p.id}`}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
