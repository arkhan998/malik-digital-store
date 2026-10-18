import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/toast';
import {
  Card, CenterLoading, PageHeader, Toggle, Modal, Field, Btn,
  TableWrap, Th, Td, inputCls,
} from './ui';

const emptyForm = {
  method: '', account_title: '', account_number: '',
  instructions: '', is_active: true,
};

export default function Settings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMethods() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('payment_methods').select('*').order('id');
      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      toast(err.message || 'Failed to load payment methods', 'error');
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

  function openEdit(m) {
    setEditing(m);
    setForm({
      method: m.method || '',
      account_title: m.account_title || '',
      account_number: m.account_number || '',
      instructions: m.instructions || '',
      is_active: !!m.is_active,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.method.trim()) {
      toast('Method name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        method: form.method.trim(),
        account_title: form.account_title.trim(),
        account_number: form.account_number.trim(),
        instructions: form.instructions.trim(),
        is_active: !!form.is_active,
      };
      let error;
      if (editing) {
        ({ error } = await supabase.from('payment_methods').update(payload).eq('id', editing.id));
      } else {
        ({ error } = await supabase.from('payment_methods').insert(payload));
      }
      if (error) throw error;
      toast(editing ? 'Payment method updated' : 'Payment method added', 'success');
      setModalOpen(false);
      fetchMethods();
    } catch (err) {
      toast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function quickToggle(id, value) {
    const { error } = await supabase.from('payment_methods').update({ is_active: value }).eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      setMethods((ms) => ms.map((m) => (m.id === id ? { ...m, is_active: value } : m)));
    }
  }

  async function remove(id, method) {
    if (!window.confirm(`Delete payment method "${method}"?`)) return;
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Payment method deleted', 'success');
      setMethods((ms) => ms.filter((m) => m.id !== id));
    }
  }

  if (loading) return <CenterLoading />;

  return (
    <div>
      <PageHeader
        title="Settings"
        sub="Payment account details shown to customers at checkout — keep these accurate"
        action={<Btn onClick={openCreate}>+ Add method</Btn>}
      />

      <Card>
        {methods.length === 0 ? (
          <p className="text-sm text-white/50 py-8 text-center">No payment methods configured.</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Method</Th>
                <Th>Account title</Th>
                <Th>Account number</Th>
                <Th>Instructions</Th>
                <Th>Active</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <Td className="font-medium whitespace-nowrap">{m.method}</Td>
                  <Td className="whitespace-nowrap">{m.account_title || '—'}</Td>
                  <Td className="font-mono whitespace-nowrap">{m.account_number || '—'}</Td>
                  <Td className="max-w-[260px]">
                    <p className="truncate text-white/60" title={m.instructions}>
                      {m.instructions || '—'}
                    </p>
                  </Td>
                  <Td>
                    <Toggle checked={m.is_active} onChange={(v) => quickToggle(m.id, v)} label={`Active: ${m.method}`} />
                  </Td>
                  <Td>
                    <div className="flex gap-1.5 justify-end">
                      <Btn variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(m)}>
                        Edit
                      </Btn>
                      <Btn variant="danger" className="px-2.5 py-1.5" onClick={() => remove(m.id, m.method)}>
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
        <Modal title={editing ? 'Edit payment method' : 'Add payment method'} onClose={() => setModalOpen(false)}>
          <div className="grid gap-4">
            <Field label="Method name *" hint="Unique, e.g. JazzCash, Easypaisa, Bank Transfer.">
              <input className={inputCls} value={form.method} onChange={(e) => set('method', e.target.value)} placeholder="JazzCash" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Account title">
                <input className={inputCls} value={form.account_title} onChange={(e) => set('account_title', e.target.value)} placeholder="Your full name" />
              </Field>
              <Field label="Account number">
                <input className={`${inputCls} font-mono`} value={form.account_number} onChange={(e) => set('account_number', e.target.value)} placeholder="0300-0000000" />
              </Field>
            </div>
            <Field label="Instructions" hint="Shown to the customer at checkout.">
              <textarea rows={3} className={inputCls} value={form.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="Send the exact total via JazzCash, then upload the screenshot." />
            </Field>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label="Method active" />
              Active (shown at checkout)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </Btn>
              <Btn onClick={save} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add method'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
