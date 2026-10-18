import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useToast } from '../lib/toast';
import {
  Card, CenterLoading, PageHeader, Toggle, Modal, Field, Btn,
  TableWrap, Th, Td, inputCls, fmtDay,
} from './ui';

const emptyForm = {
  code: '', discount_type: 'percent', discount_value: '',
  min_order: '0', is_active: true, expires_at: '',
};

function toInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Coupons() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      toast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  }

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      code: c.code || '',
      discount_type: c.discount_type || 'percent',
      discount_value: c.discount_value ?? '',
      min_order: c.min_order ?? '0',
      is_active: !!c.is_active,
      expires_at: toInputValue(c.expires_at),
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.code.trim()) {
      toast('Coupon code is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseInt(form.discount_value, 10) || 0,
        min_order: parseInt(form.min_order, 10) || 0,
        is_active: !!form.is_active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      let error;
      if (editing) {
        ({ error } = await supabase.from('coupons').update(payload).eq('id', editing.id));
      } else {
        ({ error } = await supabase.from('coupons').insert(payload));
      }
      if (error) throw error;
      toast(editing ? 'Coupon updated' : 'Coupon created', 'success');
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function quickToggle(id, value) {
    const { error } = await supabase.from('coupons').update({ is_active: value }).eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      setCoupons((cs) => cs.map((c) => (c.id === id ? { ...c, is_active: value } : c)));
    }
  }

  async function remove(id, code) {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Coupon deleted', 'success');
      setCoupons((cs) => cs.filter((c) => c.id !== id));
    }
  }

  function discountLabel(c) {
    return c.discount_type === 'percent' ? `${c.discount_value}%` : pkr(c.discount_value);
  }

  if (loading) return <CenterLoading />;

  return (
    <div>
      <PageHeader
        title="Coupons"
        sub={`${coupons.length} coupon${coupons.length === 1 ? '' : 's'}`}
        action={<Btn onClick={openCreate}>+ New coupon</Btn>}
      />

      <Card>
        {coupons.length === 0 ? (
          <p className="text-sm text-white/50 py-8 text-center">No coupons yet.</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Min order</Th>
                <Th>Expires</Th>
                <Th>Active</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono font-medium">{c.code}</Td>
                  <Td className="whitespace-nowrap">
                    {discountLabel(c)}
                    <span className="text-xs text-white/40 ml-1.5">{c.discount_type}</span>
                  </Td>
                  <Td className="whitespace-nowrap">{c.min_order > 0 ? pkr(c.min_order) : '—'}</Td>
                  <Td className="whitespace-nowrap text-white/60">{c.expires_at ? fmtDay(c.expires_at) : 'Never'}</Td>
                  <Td>
                    <Toggle checked={c.is_active} onChange={(v) => quickToggle(c.id, v)} label={`Active: ${c.code}`} />
                  </Td>
                  <Td>
                    <div className="flex gap-1.5 justify-end">
                      <Btn variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(c)}>
                        Edit
                      </Btn>
                      <Btn variant="danger" className="px-2.5 py-1.5" onClick={() => remove(c.id, c.code)}>
                        Delete
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      {modalOpen && (
        <Modal title={editing ? 'Edit coupon' : 'New coupon'} onClose={() => setModalOpen(false)}>
          <div className="grid gap-4">
            <Field label="Code *" hint="Stored in uppercase, e.g. WELCOME10.">
              <input className={`${inputCls} font-mono uppercase`} value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="WELCOME10" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Discount type">
                <select className={inputCls} value={form.discount_type} onChange={(e) => set('discount_type', e.target.value)}>
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (Rs)</option>
                </select>
              </Field>
              <Field label="Discount value *">
                <input type="number" min="0" className={inputCls} value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} placeholder={form.discount_type === 'percent' ? '10' : '200'} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Minimum order (Rs)" hint="0 = no minimum.">
                <input type="number" min="0" className={inputCls} value={form.min_order} onChange={(e) => set('min_order', e.target.value)} />
              </Field>
              <Field label="Expires at" hint="Leave empty for no expiry.">
                <input type="datetime-local" className={inputCls} value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label="Coupon active" />
              Active
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </Btn>
              <Btn onClick={save} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
