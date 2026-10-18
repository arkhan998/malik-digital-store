import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/toast';
import {
  Card, CenterLoading, PageHeader, Btn, fmtDate,
} from './ui';

function Stars({ rating }) {
  return (
    <span className="text-amber-400 tracking-tight" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

function ReviewCard({ review, onApprove, onDelete, approving, deleting }) {
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-[#0b0b12]/60">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white">{review.name}</span>
          <Stars rating={review.rating} />
          <span className="text-xs text-white/40">{fmtDate(review.created_at)}</span>
        </div>
        <div className="flex gap-1.5">
          {onApprove && (
            <Btn variant="success" className="px-2.5 py-1.5" disabled={approving} onClick={() => onApprove(review)}>
              {approving ? 'Approving…' : 'Approve'}
            </Btn>
          )}
          <Btn variant="danger" className="px-2.5 py-1.5" disabled={deleting} onClick={() => onDelete(review)}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Btn>
        </div>
      </div>
      <p className="text-xs text-orange-400/90 mb-1.5">
        On: {review.products?.title || `Product #${review.product_id}`}
      </p>
      <p className="text-sm text-white/75 whitespace-pre-wrap">{review.text}</p>
    </div>
  );
}

export default function Reviews() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const all = data || [];
      setPending(all.filter((r) => !r.is_approved));
      setApproved(all.filter((r) => r.is_approved));
    } catch (err) {
      toast(err.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function approve(r) {
    setBusyId(r.id);
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', r.id);
      if (error) throw error;
      setPending((ps) => ps.filter((x) => x.id !== r.id));
      setApproved((as) => [{ ...r, is_approved: true }, ...as]);
      toast('Review approved', 'success');
    } catch (err) {
      toast(err.message || 'Approve failed', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(r) {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setBusyId(r.id);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', r.id);
      if (error) throw error;
      setPending((ps) => ps.filter((x) => x.id !== r.id));
      setApproved((as) => as.filter((x) => x.id !== r.id));
      toast('Review deleted', 'success');
    } catch (err) {
      toast(err.message || 'Delete failed', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <CenterLoading />;

  return (
    <div>
      <PageHeader title="Reviews" sub="Approve new reviews before they appear in the store" />

      <Card className="mb-6">
        <h2 className="text-base font-semibold text-white mb-1">
          Pending approval{' '}
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {pending.length}
          </span>
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-white/50 py-6 text-center">No pending reviews. 🎉</p>
        ) : (
          <div className="grid gap-3 mt-3">
            {pending.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onApprove={approve}
                onDelete={remove}
                approving={busyId === r.id}
                deleting={busyId === r.id}
              />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-white mb-1">
          Approved{' '}
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {approved.length}
          </span>
        </h2>
        {approved.length === 0 ? (
          <p className="text-sm text-white/50 py-6 text-center">No approved reviews yet.</p>
        ) : (
          <div className="grid gap-3 mt-3">
            {approved.map((r) => (
              <ReviewCard key={r.id} review={r} onDelete={remove} deleting={busyId === r.id} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
