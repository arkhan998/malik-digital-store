import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';

function Section({ title, children }) {
  return (
    <Reveal>
      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="mt-3 space-y-3 text-gray-300 leading-relaxed">{children}</div>
      </section>
    </Reveal>
  );
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Refund Policy' }]} />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Refund Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: October 2026</p>

        <Section title="Digital products">
          <p>
            All products sold on MALIK Digital Store are digital and delivered electronically.
            Because a digital file cannot be "returned", refunds are handled differently from
            physical goods.
          </p>
        </Section>

        <Section title="When you ARE eligible for a refund">
          <ul className="list-disc pl-5 space-y-2">
            <li>The file you received is broken or corrupt and we cannot repair or replace it within 48 hours.</li>
            <li>You were charged twice for the same order.</li>
            <li>The product delivered is materially different from its description and no fix is possible.</li>
          </ul>
        </Section>

        <Section title="When you are NOT eligible for a refund">
          <ul className="list-disc pl-5 space-y-2">
            <li>You changed your mind after the file was delivered.</li>
            <li>You bought the wrong product by mistake (contact us first — we may help you switch).</li>
            <li>Your payment is still pending verification.</li>
          </ul>
        </Section>

        <Section title="How to request a refund">
          <p>
            Message us on WhatsApp at{' '}
            <a
              href="https://wa.me/923322964709"
              target="_blank"
              rel="noreferrer"
              className="text-[#00b4ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff] rounded"
            >
              +92 332 2964709
            </a>{' '}
            with your order ID and a short description of the problem. We review every request
            within 48 hours.
          </p>
        </Section>

        <Section title="How refunds are paid">
          <p>
            Approved refunds are sent back to your JazzCash or Easypaisa account within 3–5
            working days of approval.
          </p>
        </Section>
      </div>
    </div>
  );
}
