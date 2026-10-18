import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useToast } from '../lib/toast';
import {
  Card, CenterLoading, PageHeader, Toggle, Modal, Field, Btn,
  TableWrap, Th, Td, inputCls, slugify, fmtDay,
} from './ui';

const emptyForm = {
  title: '', slug: '', short_desc: '', full_desc: '',
  whats_included: '', price: '', sale_price: '',
  category_id: '', tags: '', preview_urls: '',
  cover_url: '', file_path: '',
  is_active: true, is_featured: false, is_new: false,
};

const linesToText = (arr) => (arr || []).join('\n');
const textToLines = (s) => (s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const textToTags = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

export default function Products() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name'),
      ]);
      if (pRes.error) throw pRes.error;
      if (cRes.error) throw cRes.error;
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      toast(err.message || 'Failed to load products', 'error');
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
    setSlugTouched(false);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      short_desc: p.short_desc || '',
      full_desc: p.full_desc || '',
      whats_included: linesToText(p.whats_included),
      price: p.price ?? '',
      sale_price: p.sale_price ?? '',
      category_id: p.category_id || '',
      tags: (p.tags || []).join(', '),
      preview_urls: linesToText(p.preview_urls),
      cover_url: p.cover_url || '',
      file_path: p.file_path || '',
      is_active: !!p.is_active,
      is_featured: !!p.is_featured,
      is_new: !!p.is_new,
    });
    setSlugTouched(true);
    setModalOpen(true);
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingCover(true);
    try {
      const safe = file.name.replace(/\s+/g, '-');
      const path = `${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from('covers').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('covers').getPublicUrl(path);
      set('cover_url', data.publicUrl);
      toast('Cover uploaded', 'success');
    } catch (err) {
      toast(err.message || 'Cover upload failed', 'error');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingFile(true);
    try {
      const safe = file.name.replace(/\s+/g, '-');
      const path = `products/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from('product-files').upload(path, file);
      if (error) throw error;
      set('file_path', path);
      toast('Product file uploaded', 'success');
    } catch (err) {
      toast(err.message || 'File upload failed', 'error');
    } finally {
      setUploadingFile(false);
    }
  }

  async function save() {
    if (!form.title.trim()) {
      toast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        short_desc: form.short_desc.trim(),
        full_desc: form.full_desc.trim(),
        whats_included: textToLines(form.whats_included),
        price: parseInt(form.price, 10) || 0,
        sale_price: form.sale_price === '' || form.sale_price == null ? null : parseInt(form.sale_price, 10),
        category_id: form.category_id === '' ? null : Number(form.category_id),
        tags: textToTags(form.tags),
        preview_urls: textToLines(form.preview_urls),
        cover_url: form.cover_url.trim() || null,
        file_path: form.file_path.trim() || null,
        is_active: !!form.is_active,
        is_featured: !!form.is_featured,
        is_new: !!form.is_new,
      };
      let error;
      if (editing) {
        ({ error } = await supabase.from('products').update(payload).eq('id', editing.id));
      } else {
        ({ error } = await supabase.from('products').insert(payload));
      }
      if (error) throw error;
      toast(editing ? 'Product updated' : 'Product created', 'success');
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function quickToggle(id, column, value) {
    const { error } = await supabase.from('products').update({ [column]: value }).eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, [column]: value } : p)));
    }
  }

  async function remove(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Product deleted', 'success');
      setProducts((ps) => ps.filter((p) => p.id !== id));
    }
  }

  if (loading) return <CenterLoading />;

  return (
    <div>
      <PageHeader
        title="Products"
        sub={`${products.length} product${products.length === 1 ? '' : 's'}`}
        action={<Btn onClick={openCreate}>+ New product</Btn>}
      />

      <Card>
        {products.length === 0 ? (
          <p className="text-sm text-white/50 py-8 text-center">
            No products yet. Click “New product” to add your first one.
          </p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Cover</Th>
                <Th>Title</Th>
                <Th>Price</Th>
                <Th>Sale</Th>
                <Th>Category</Th>
                <Th>Active</Th>
                <Th>Featured</Th>
                <Th>New</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <Td>
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-xs">
                        —
                      </div>
                    )}
                  </Td>
                  <Td className="max-w-[220px]">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-white/40 truncate">{p.slug}</p>
                  </Td>
                  <Td className="whitespace-nowrap">{pkr(p.price)}</Td>
                  <Td className="whitespace-nowrap">{p.sale_price != null ? pkr(p.sale_price) : '—'}</Td>
                  <Td className="whitespace-nowrap">{p.categories?.name || '—'}</Td>
                  <Td>
                    <Toggle checked={p.is_active} onChange={(v) => quickToggle(p.id, 'is_active', v)} label={`Active: ${p.title}`} />
                  </Td>
                  <Td>
                    <Toggle checked={p.is_featured} onChange={(v) => quickToggle(p.id, 'is_featured', v)} label={`Featured: ${p.title}`} />
                  </Td>
                  <Td>
                    <Toggle checked={p.is_new} onChange={(v) => quickToggle(p.id, 'is_new', v)} label={`New: ${p.title}`} />
                  </Td>
                  <Td>
                    <div className="flex gap-1.5 justify-end">
                      <Btn variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(p)}>
                        Edit
                      </Btn>
                      <Btn variant="danger" className="px-2.5 py-1.5" onClick={() => remove(p.id, p.title)}>
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
        <Modal title={editing ? 'Edit product' : 'New product'} onClose={() => setModalOpen(false)}>
          <div className="grid gap-4">
            <Field label="Title *">
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
                placeholder="AI Faceless Videos Ebook"
              />
            </Field>
            <Field label="Slug" hint="URL-friendly identifier, auto-generated from title.">
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder="ai-faceless-videos-ebook"
              />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Price (Rs) *">
                <input type="number" min="0" className={inputCls} value={form.price} onChange={(e) => set('price', e.target.value)} />
              </Field>
              <Field label="Sale price (Rs)" hint="Leave empty for no sale.">
                <input type="number" min="0" className={inputCls} value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} />
              </Field>
              <Field label="Category">
                <select className={inputCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Short description">
              <textarea rows={2} className={inputCls} value={form.short_desc} onChange={(e) => set('short_desc', e.target.value)} />
            </Field>
            <Field label="Full description">
              <textarea rows={5} className={inputCls} value={form.full_desc} onChange={(e) => set('full_desc', e.target.value)} />
            </Field>
            <Field label="What's included" hint="One item per line.">
              <textarea rows={4} className={inputCls} value={form.whats_included} onChange={(e) => set('whats_included', e.target.value)} />
            </Field>
            <Field label="Tags" hint="Comma separated, e.g. ai, video, ebook.">
              <input className={inputCls} value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            </Field>
            <Field label="Preview URLs" hint="One URL per line (public preview images/videos).">
              <textarea rows={2} className={inputCls} value={form.preview_urls} onChange={(e) => set('preview_urls', e.target.value)} />
            </Field>

            <Field label="Cover image">
              <div className="flex items-center gap-3 flex-wrap">
                {form.cover_url && (
                  <img src={form.cover_url} alt="Cover preview" loading="lazy" className="h-16 w-16 rounded-lg object-cover border border-white/10" />
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 focus-visible:outline-2 focus-visible:outline-orange-500">
                    {uploadingCover ? 'Uploading…' : 'Upload cover'}
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploadingCover} />
                </label>
              </div>
              <input
                className={`${inputCls} mt-2`}
                value={form.cover_url}
                onChange={(e) => set('cover_url', e.target.value)}
                placeholder="…or paste a cover image URL"
              />
            </Field>

            <Field label="Product file" hint="Uploaded to the private product-files bucket. Buyers get a 1-hour signed download link after delivery.">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 focus-visible:outline-2 focus-visible:outline-orange-500">
                    {uploadingFile ? 'Uploading…' : 'Upload file'}
                  </span>
                  <input type="file" className="sr-only" onChange={handleFileUpload} disabled={uploadingFile} />
                </label>
                {form.file_path && <span className="text-xs text-white/50 break-all">{form.file_path}</span>}
              </div>
            </Field>

            <div className="flex flex-wrap gap-5">
              {[
                ['is_active', 'Active (visible in store)'],
                ['is_featured', 'Featured (homepage)'],
                ['is_new', 'Mark as new'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <Toggle checked={form[key]} onChange={(v) => set(key, v)} label={label} />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </Btn>
              <Btn onClick={save} disabled={saving || uploadingCover || uploadingFile}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
              </Btn>
            </div>
            {editing && (
              <p className="text-xs text-white/40">Created: {fmtDay(editing.created_at)}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
