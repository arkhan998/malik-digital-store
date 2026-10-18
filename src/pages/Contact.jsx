import { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';
import { useToast } from '../lib/toast';

const WHATSAPP = '923322964709';
const PHONE_DISPLAY = '+92 332 2964709';

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = (e) => {
    e.preventDefault();
    // Per contract: toast + WhatsApp note (no backend ticket table exists yet).
    toast('Message noted! For the fastest reply, message us on WhatsApp.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]';

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
        <Reveal>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Contact Us</h1>
          <p className="mt-2 text-gray-400">
            Questions about a product, an order, or a refund — reach out. We reply fastest on
            WhatsApp.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-[#15151d] p-6">
              <h2 className="font-bold text-white">Direct channels</h2>
              <div className="mt-4 space-y-4">
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0b0b12] p-4 transition hover:border-[#00b4ff]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b4ff] to-[#8b5cf6] text-xl">
                    ✆
                  </div>
                  <div>
                    <p className="font-semibold text-white">WhatsApp</p>
                    <p className="text-sm text-gray-400">{PHONE_DISPLAY} — fastest replies</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0b0b12] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff2e88] text-xl">
                    ☎
                  </div>
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <p className="text-sm text-gray-400">{PHONE_DISPLAY}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Support hours: 10 AM – 10 PM (PKT), 7 days a week.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <form
              onSubmit={submit}
              className="rounded-2xl border border-white/10 bg-[#15151d] p-6 space-y-4"
            >
              <h2 className="font-bold text-white">Send a message</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                aria-label="Your name"
                className={inputCls}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                aria-label="Your email"
                className={inputCls}
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                required
                rows={4}
                aria-label="Your message"
                className={inputCls}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3 font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                Send Message
              </button>
              <p className="text-xs text-gray-500 text-center">
                We reply on WhatsApp — include your WhatsApp number in the message for a faster response.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
