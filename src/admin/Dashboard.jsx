import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useToast } from '../lib/toast';
import { Card, CenterLoading, PageHeader, StatusBadge, TableWrap, Th, Td, fmtDate } from './ui';

const PAID = ['verified', 'delivered'];

function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function Dashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [recent, setRecent] = useState([]);
  const [week, setWeek] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes, cRes, revRes, recRes, weekRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('total').in('status', PAID),
          supabase.from('orders').select('id, email, total, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase
            .from('orders')
            .select('total, created_at')
            .in('status', PAID)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        for (const r of [pRes, oRes, cRes, revRes, recRes, weekRes]) {
          if (r.error) throw r.error;
        }

        const revenue = (revRes.data || []).reduce((s, o) => s + (o.total || 0), 0);
        setStats({
          products: pRes.count || 0,
          orders: oRes.count || 0,
          customers: cRes.count || 0,
          revenue,
        });
        setRecent(recRes.data || []);

        // 7-day revenue buckets (local days)
        const days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0, 0, 0, 0);
          return d;
        });
        const sums = Object.fromEntries(days.map((d) => [dayKey(d), 0]));
        for (const o of weekRes.data || []) {
          const k = dayKey(new Date(o.created_at));
          if (k in sums) sums[k] += o.total || 0;
        }
        setWeek(
          days.map((d) => ({
            key: dayKey(d),
            label: d.toLocaleDateString('en-PK', { weekday: 'short' }),
            value: sums[dayKey(d)],
          }))
        );
      } catch (err) {
        toast(err.message || 'Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <CenterLoading />;

  const statCards = [
    { label: 'Products', value: String(stats.products) },
    { label: 'Orders', value: String(stats.orders) },
    { label: 'Customers', value: String(stats.customers) },
    { label: 'Revenue (paid)', value: pkr(stats.revenue) },
  ];
  const maxWeek = Math.max(1, ...week.map((w) => w.value));

  return (
    <div>
      <PageHeader title="Dashboard" sub="Store overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-wider text-white/50">{s.label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-white">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Revenue — last 7 days</h2>
          <span className="text-xs text-white/40">paid orders only</span>
        </div>
        <div className="flex items-end gap-2 sm:gap-3 h-40">
          {week.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <span className="text-[11px] text-white/50 mb-1 truncate">
                {d.value > 0 ? pkr(d.value) : ''}
              </span>
              <div
                className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-[#ff7a1a] via-[#ff2e88] to-[#8b5cf6] transition-all"
                style={{ height: `${Math.max(d.value > 0 ? 6 : 2, (d.value / maxWeek) * 100)}%` }}
                title={`${d.label}: ${pkr(d.value)}`}
              />
              <span className="text-[11px] text-white/50 mt-1.5">{d.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Recent orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-orange-400 hover:text-orange-300 focus-visible:outline-2 focus-visible:outline-orange-500 rounded"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-white/50 py-6 text-center">No orders yet.</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono">#{o.id}</Td>
                  <Td className="max-w-[180px] truncate">{o.email}</Td>
                  <Td>{pkr(o.total)}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td className="text-white/50 whitespace-nowrap">{fmtDate(o.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
