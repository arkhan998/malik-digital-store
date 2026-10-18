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

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: October 2026</p>

        <Section title="What we collect">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-white">Contact details</strong> — your email address and
              WhatsApp number, provided at checkout or sign-up, used for order updates and
              delivery.
            </li>
            <li>
              <strong className="text-white">Order details</strong> — products purchased, payment
              method, and payment screenshots, used to verify and fulfil your orders.
            </li>
            <li>
              <strong className="text-white">Reviews</strong> — your name and review text if you
              choose to submit one.
            </li>
            <li>
              <strong className="text-white">Newsletter</strong> — your email if you subscribe,
              used only for store updates and offers.
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>
            We use your data to process orders, verify payments, deliver files, provide support,
            and — only if you opted in — send marketing emails. We never sell your personal
            information.
          </p>
        </Section>

        <Section title="Who sees it">
          <p>
            Only the store team sees your order and contact data. Payment screenshots are stored
            privately and are visible only to you and our admins.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask us to update or delete your personal data at any time by messaging us on
            WhatsApp at +92 332 2964709. Unsubscribe from the newsletter anytime with the link in
            any email.
          </p>
        </Section>
      </div>
    </div>
  );
}
