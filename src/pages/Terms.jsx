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

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Terms of Service' }]} />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: October 2026</p>

        <Section title="1. What we sell">
          <p>
            MALIK Digital Store sells digital products (ebooks, prompt packs, templates, and
            similar downloadable files). Nothing physical is shipped. All prices are in Pakistani
            Rupees (PKR) and include any applicable taxes.
          </p>
        </Section>

        <Section title="2. Ordering and payment">
          <p>
            Orders are placed on this website by adding products to your cart and checking out.
            Payment is made via JazzCash or Easypaisa to the account details shown at checkout.
            Your order is confirmed only after you upload a valid payment screenshot and we verify
            the payment — this usually takes a few hours.
          </p>
        </Section>

        <Section title="3. Delivery">
          <p>
            Once your payment is verified, your files become available under Account → My
            Downloads. You may re-download them anytime. If verification fails, we will contact
            you on WhatsApp or email to resolve it.
          </p>
        </Section>

        <Section title="4. License of use">
          <p>
            Every purchase grants you a personal, non-transferable license to use the product.
            You may not resell, redistribute, or publicly share the files unless the product
            description explicitly allows it.
          </p>
        </Section>

        <Section title="5. Accounts">
          <p>
            You are responsible for keeping your account credentials safe. An account is optional
            for checkout, but required to access downloads and order tracking. We may suspend
            accounts used for fraud or abuse.
          </p>
        </Section>

        <Section title="6. Refunds">
          <p>
            Refunds follow our{' '}
            <a href="/refund-policy" className="text-[#00b4ff] hover:underline">
              Refund Policy
            </a>
            , which forms part of these terms.
          </p>
        </Section>

        <Section title="7. Changes">
          <p>
            We may update these terms at any time. Continued use of the store after changes are
            posted means you accept them. For questions, contact us on WhatsApp at +92 332 2964709.
          </p>
        </Section>
      </div>
    </div>
  );
}
