import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

// ── Smooth-scroll helper ──────────────────────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 40);
      const t = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(t); }
        else setVal(start);
      }, 30);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── FAQ item ─────────────────────────────────────────────────────────────────
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700 rounded overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-white font-medium text-sm hover:bg-slate-800 transition-colors">
        {q}
        <span className={`text-blue-400 text-lg transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const features = [
    {
      icon: '⚡',
      title: 'Smart Match Feed',
      desc: 'See who is going to your exam center at a glance. Filtered by destination, date, and batch — no noise, just relevant matches.'
    },
    {
      icon: '🤝',
      title: 'Request Handshake',
      desc: 'Secure "Request to Connect" system. No random DMs. You only chat with people whose requests you have explicitly accepted.'
    },
    {
      icon: '💬',
      title: 'Real-Time Chat',
      desc: 'Integrated Socket.io messaging platform that unlocks the moment a match is accepted. Instant, private, and scoped to your trip.'
    },
    {
      icon: '📧',
      title: 'Email Sync',
      desc: 'Automated Gmail alerts for every new message and match acceptance. You are never out of the loop, even when offline.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Identity',
      desc: 'Register with your college email. Only @stjosephs.ac.in addresses are accepted — no outsiders.'
    },
    {
      num: '02',
      title: 'Verification',
      desc: 'A 6-digit OTP is sent to your college mail. Powered by Nodemailer. Expires in 10 minutes.'
    },
    {
      num: '03',
      title: 'Discovery',
      desc: 'Browse the live match feed or post your own travel requirement with destination, date, and batch.'
    },
    {
      num: '04',
      title: 'Connection',
      desc: 'Accept a join request. A private MatchID is generated and the chat window unlocks instantly.'
    }
  ];

  const faqs = [
    {
      q: 'Why do I need a college email?',
      a: 'To ensure only genuine students from St. Joseph\'s College of Engineering, Chennai can access the platform. This keeps the community safe and trusted.'
    },
    {
      q: 'Can anyone message me?',
      a: 'No. We value your privacy. You only chat with people whose join requests you have personally accepted. No unsolicited messages.'
    },
    {
      q: 'What if the exam is over?',
      a: 'The system automatically archives posts after the travel date has passed to keep the feed clean and relevant.'
    },
    {
      q: 'Is my data safe?',
      a: 'Yes. Passwords are bcrypt-hashed, sessions are stored in MongoDB, and all private routes are JWT-protected.'
    },
    {
      q: 'What exams does this support?',
      a: 'Any exam or college event — NPTEL, GATE, competitive exams, inter-college fests. If you\'re traveling, you can post it.'
    }
  ];

  return (
    <div className="bg-[#0f172a] text-white min-h-screen">

      {/* ── STICKY NAV ─────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-[#0f172a]/80 border-b border-slate-700/60 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">
            Campus <span className="text-blue-400">LinkUp</span>
          </span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            {['intro', 'features', 'process', 'faq'].map(id => (
              <button key={id} onClick={() => scrollTo(id)}
                className="hover:text-white transition-colors capitalize">
                {id === 'intro' ? 'Home' : id === 'process' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="border border-slate-600 hover:border-blue-400 text-slate-300 hover:text-white text-sm px-4 py-2 rounded transition-all duration-200">
              Login
            </Link>
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded flex items-center gap-2 transition-all duration-200 hover:scale-105">
              Get Started <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section id="intro" className="min-h-screen flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Narrative */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase border border-blue-800 bg-blue-950/40 px-3 py-1 rounded-full mb-6">
              Exclusive · St. Joseph's College of Engineering, Chennai
            </span>
            <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              Commute Together.<br />
              <span className="text-blue-400">Succeed Together.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
              A peer-to-peer travel coordination platform built exclusively for students.
              Bridge the gap between solo travel and safe, shared commutes to your exam centers.
              Find verified travel partners in seconds — not hours.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded transition-all duration-200 hover:scale-105">
                Create Account
              </Link>
              <button onClick={() => scrollTo('process')}
                className="border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white font-semibold px-8 py-3 rounded transition-all duration-200">
                See How It Works
              </button>
            </div>
          </div>

          {/* Right — Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 col-span-2">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Coordination Speed</p>
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">WhatsApp Groups</p>
                  <div className="h-3 bg-slate-700 rounded-full w-full" />
                </div>
                <span className="text-slate-500 text-xs shrink-0">~2 hrs</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <p className="text-xs text-blue-400 mb-1 font-medium">Campus LinkUp</p>
                  <div className="h-3 bg-blue-600 rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-blue-400 text-xs font-bold shrink-0">~40 min</span>
              </div>
              <p className="text-green-400 text-xs font-semibold mt-3">↑ 40% faster coordination</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Avg. Cost Saved</p>
              <p className="text-3xl font-extrabold text-white">
                ₹<Counter target={180} />
              </p>
              <p className="text-slate-500 text-xs mt-1">per trip by sharing cab</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Verified Users</p>
              <p className="text-3xl font-extrabold text-white">
                <Counter target={100} suffix="%" />
              </p>
              <p className="text-slate-500 text-xs mt-1">college email only</p>
            </div>

            <div className="bg-blue-950/60 border border-blue-800 rounded-xl p-6 col-span-2 flex items-center gap-4">
              <span className="text-3xl">🔒</span>
              <div>
                <p className="text-white font-semibold text-sm">Privacy First</p>
                <p className="text-slate-400 text-xs mt-0.5">No one can message you without your explicit approval. Every connection requires a handshake.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">Platform Features</span>
            <h2 className="text-3xl font-extrabold text-white mt-3">The Engine Behind the Platform</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Every feature is designed with one goal — make student travel coordination safe, fast, and effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.title}
                className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 hover:border-blue-600 hover:bg-slate-800/70 transition-all duration-200 group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: ONBOARDING FLOW ─────────────────────────────────────── */}
      <section id="process" className="py-24 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">Onboarding</span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Up and Running in 4 Steps</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              From registration to your first travel match — the entire process takes under 3 minutes.
            </p>
          </div>

          {/* Progress line + steps */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-slate-700 mx-16" />
            <div className="hidden lg:block absolute top-8 left-0 h-px bg-blue-600 mx-16 transition-all" style={{ width: '75%' }} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <div key={s.num} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  {/* Step circle */}
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5 z-10 font-bold text-sm
                    ${i < 3 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                    {i < 3 ? '✓' : s.num}
                  </div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">{s.num}</p>
                  <h3 className="text-white font-bold mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-14">
            <Link to="/register"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-lg text-base transition-all duration-200 hover:scale-105">
              Register Now — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: SECURE WORKFLOW ─────────────────────────────────────── */}
      <section className="py-24 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">Security</span>
            <h2 className="text-3xl font-extrabold text-white mt-3">The Gatekeeper Logic</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Every interaction is gated. No one gets access to you without your explicit approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                color: 'blue',
                title: 'Request to Connect',
                desc: 'User A clicks "Request to Join" on User B\'s post. No message is sent yet — only a connection request.'
              },
              {
                step: '2',
                color: 'yellow',
                title: 'Approval Gate',
                desc: 'User B receives a notification and must explicitly click "Accept". Declining keeps the feed clean.'
              },
              {
                step: '3',
                color: 'green',
                title: 'Chat Unlocked',
                desc: 'Only after acceptance does a unique MatchID generate, opening the private message window for both users.'
              }
            ].map(item => (
              <div key={item.step} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4
                  ${item.color === 'blue' ? 'bg-blue-600 text-white' : item.color === 'yellow' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Email trigger info */}
          <div className="mt-8 bg-blue-950/40 border border-blue-800 rounded-xl p-6 flex gap-5 items-start">
            <span className="text-2xl shrink-0">📬</span>
            <div>
              <p className="text-white font-semibold mb-1">Offline Email Trigger</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Whenever a message is sent, the backend checks if the receiver is currently active in the chat.
                If offline, a Gmail alert is dispatched instantly: <span className="text-blue-300 italic">"You have an unread coordination message on Campus LinkUp."</span> — with a direct link back to the chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">FAQ</span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Frequent Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white">
            Campus <span className="text-blue-400">LinkUp</span>
          </span>
          <p className="text-slate-500 text-sm">Built for St. Joseph's College of Engineering · Chennai</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
