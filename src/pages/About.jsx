import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';
import SectionHead from '../components/SectionHead';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />
        <Reveal>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            About{' '}
            <span className="bg-gradient-to-r from-[#ff7a1a] via-[#ff2e88] to-[#8b5cf6] bg-clip-text text-transparent">
              MALIK Digital Store
            </span>
          </h1>
        </Reveal>

        <div className="mt-8 space-y-6 text-gray-300 leading-relaxed">
          <Reveal>
            <p>
              MALIK Digital Store is a small independent shop selling premium digital products —
              ebooks, prompt packs, templates, and creative resources built for creators,
              freelancers, and small businesses in Pakistan and beyond.
            </p>
          </Reveal>
          <Reveal>
            <p>
              We keep things simple: honest prices in PKR, payment through JazzCash and Easypaisa,
              and delivery straight to your account. No subscriptions, no hidden fees, no waiting
              for couriers — you pay, we verify, you download.
            </p>
          </Reveal>
        </div>

        <div className="mt-10">
          <Reveal>
            <SectionHead title="Why shop with us" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { t: 'Honest Pricing', d: 'Clear PKR prices. Discounts and coupon codes are announced openly — the price you see is the price you pay.' },
              { t: 'Fast Delivery', d: 'Payments are verified within a few hours, and your files stay in your account for re-download anytime.' },
              { t: 'Human Support', d: 'Questions before or after your purchase? Message us on WhatsApp and talk to a real person.' },
            ].map((c) => (
              <Reveal key={c.t}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#15151d] p-6">
                  <h3 className="font-bold text-white">{c.t}</h3>
                  <p className="mt-2 text-sm text-gray-400">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#15151d] p-8 text-center">
            <h2 className="text-xl font-bold text-white">Have a question?</h2>
            <p className="mt-2 text-sm text-gray-400">We reply fastest on WhatsApp.</p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/923322964709"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-8 py-3 font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88]"
              >
                Chat on WhatsApp
              </a>
              <Link
                to="/contact"
                className="rounded-xl border border-white/15 px-8 py-3 font-semibold text-white transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
              >
                Contact Page
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
