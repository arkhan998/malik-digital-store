import { Fragment, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useToast } from '../lib/toast';
import {
  Card, CenterLoading, PageHeader, Btn,
  TableWrap, Th, Td, StatusBadge, fmtDate,
} from './ui';

export default function Orders() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [shotUrls, setShotUrls] = useState({});
  const [shotLoading, setShotLoading] = useState({});
  const [shotError, setShotError] = useState({});
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(id, price, products(id, title))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      toast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(order) {
    const id = order.id;
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (order.payment_screenshot_path && !shotUrls[id] && !shotError[id]) {
      setShotLoading((s) => ({ ...s, [id]: true }));
      try {
        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .createSignedUrl(order.payment_screenshot_path, 3600);
        if (error) throw error;
        setShotUrls((s) => ({ ...s, [id]: data.signedUrl }));
      } catch (err) {
        setShotError((s) => ({ ...s, [id]: err.message || 'Could not load screenshot' }));
      } finally {
        setShotLoading((s) => ({ ...s, [id]: false }));
      }
    }
  }

  async function setStatus(order, status) {
    if (status === 'rejected') {
      if (!window.confirm(`Reject order #${order.id}? The customer will need to be contacted separately.`)) return;
    }
    setActingId(order.id);
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
      if (error) throw error;
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status } : o)));
      toast(`Order #${order.id} marked as ${status}`, 'success');
    } catch (err) {
      toast(err.message || 'Status update failed', 'error');
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <CenterLoading />;

  return (
    <div>
      <PageHeader title="Orders" sub={`${orders.length} order${orders.length === 1 ? '' : 's'}`} />

      <Card>
        {orders.length === 0 ? (
          <p className="text-sm text-white/50 py-8 text-center">No orders yet.</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>WhatsApp</Th>
                <Th>Total</Th>
                <Th>Coupon</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const expanded = expandedId === o.id;
                return (
                  <Fragment key={o.id}>
                    <tr
                      className={`hover:bg-white/[0.02] cursor-pointer ${expanded ? 'bg-white/[0.03]' : ''}`}
                      onClick={() => toggleExpand(o)}
                    >
                      <Td className="font-mono whitespace-nowrap">
                        <span className="mr-1.5 text-white/40">{expanded ? '▾' : '▸'}</span>#{o.id}
                      </Td>
                      <Td className="max-w-[180px] truncate">{o.email}</Td>
                      <Td className="whitespace-nowrap">{o.whatsapp}</Td>
                      <Td className="whitespace-nowrap font-medium">{pkr(o.total)}</Td>
                      <Td className="whitespace-nowrap">{o.coupon_code || '—'}</Td>
                      <Td>
                        <StatusBadge status={o.status} />
                      </Td>
                      <Td className="text-white/50 whitespace-nowrap">{fmtDate(o.created_at)}</Td>
                      <Td onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-end">
                          {o.status === 'pending' && (
                            <Btn
                              variant="success"
                              className="px-2.5 py-1.5"
                              disabled={actingId === o.id}
                              onClick={() => setStatus(o, 'verified')}
                            >
                              Approve
                            </Btn>
                          )}
                          {o.status === 'verified' && (
                            <Btn
                              variant="primary"
                              className="px-2.5 py-1.5"
                              disabled={actingId === o.id}
                              onClick={() => setStatus(o, 'delivered')}
                            >
                              Deliver
                            </Btn>
                          )}
                          {(o.status === 'pending' || o.status === 'verified') && (
                            <Btn
                              variant="danger"
                              className="px-2.5 py-1.5"
                              disabled={actingId === o.id}
                              onClick={() => setStatus(o, 'rejected')}
                            >
                              Reject
                            </Btn>
                          )}
                        </div>
                      </Td>
                    </tr>
                    {expanded && (
                      <tr>
                        <Td colSpan={8} className="!py-4 bg-white/[0.02]">
                          <div className="grid md:grid-cols-2 gap-5">
                            <div>
                              <h3 className="text-sm font-semibold text-white/70 mb-2">
                                Items ({(o.order_items || []).length})
                              </h3>
                              {(o.order_items || []).length === 0 ? (
                                <p className="text-sm text-white/40">No items recorded.</p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {o.order_items.map((it) => (
                                    <li key={it.id} className="flex justify-between gap-3 text-sm">
                                      <span className="text-white/80 truncate">
                                        {it.products?.title || `Product #${it.product_id ?? '?'}`}
                                      </span>
                                      <span className="text-white/60 whitespace-nowrap">{pkr(it.price)}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <dl className="mt-4 space-y-1 text-sm">
                                <div className="flex justify-between gap-3">
                                  <dt className="text-white/50">Payment method</dt>
                                  <dd className="text-white/80">{o.payment_method}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-white/50">Subtotal</dt>
                                  <dd className="text-white/80">{pkr(o.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-white/50">Discount</dt>
                                  <dd className="text-white/80">− {pkr(o.discount)}</dd>
                                </div>
                                <div className="flex justify-between gap-3 font-medium">
                                  <dt className="text-white/70">Total</dt>
                                  <dd className="text-white">{pkr(o.total)}</dd>
                                </div>
                              </dl>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white/70 mb-2">Payment screenshot</h3>
                              {!o.payment_screenshot_path ? (
                                <p className="text-sm text-white/40">No screenshot uploaded.</p>
                              ) : shotLoading[o.id] ? (
                                <p className="text-sm text-white/40">Loading screenshot…</p>
                              ) : shotError[o.id] ? (
                                <p className="text-sm text-red-300/80">{shotError[o.id]}</p>
                              ) : shotUrls[o.id] ? (
                                <a href={shotUrls[o.id]} target="_blank" rel="noreferrer" className="block max-w-xs focus-visible:outline-2 focus-visible:outline-orange-500 rounded-lg">
                                  <img
                                    src={shotUrls[o.id]}
                                    alt={`Payment screenshot for order #${o.id}`}
                                    loading="lazy"
                                    className="rounded-lg border border-white/10 max-h-64 object-contain"
                                  />
                                  <span className="text-xs text-orange-400 mt-1 inline-block">Open full size ↗</span>
                                </a>
                              ) : (
                                <p className="text-sm text-white/40">Screenshot unavailable.</p>
                              )}
                            </div>
                          </div>
                        </Td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
