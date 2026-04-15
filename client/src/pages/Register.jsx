import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith('@stjosephs.ac.in'))
      return setError('Only @stjosephs.ac.in emails allowed');
    setLoading(true); setError('');
    try {
      await api.post('/auth/send-otp', form);
      setStep('otp');
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return setError('Enter the complete 6-digit OTP');
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: otpValue });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/resend-otp', { email: form.email });
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {step === 'form' ? (
          <>
            <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm mb-8">Use your St. Joseph's College of Engineering email to register</p>

            {error && <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input type="text" required placeholder="Your name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-navy-800 border border-navy-700 text-white px-4 py-3 rounded focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">College Email</label>
                <input type="email" required placeholder="you@stjosephs.ac.in"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-navy-800 border border-navy-700 text-white px-4 py-3 rounded focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                <input type="password" required placeholder="Min. 6 characters" minLength={6}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-navy-800 border border-navy-700 text-white px-4 py-3 rounded focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <p className="text-slate-400 text-sm mt-6 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <button onClick={() => { setStep('form'); setError(''); }}
              className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-white mb-1">Verify your email</h1>
            <p className="text-slate-400 text-sm mb-2">
              We sent a 6-digit OTP to
            </p>
            <p className="text-blue-400 text-sm font-medium mb-8">{form.email}</p>

            {error && <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleVerify}>
              {/* OTP boxes */}
              <div className="flex gap-3 justify-between mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-navy-800 border border-navy-700 text-white rounded focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.join('').length < 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors">
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              {resendTimer > 0 ? (
                <p className="text-slate-500 text-sm">Resend OTP in {resendTimer}s</p>
              ) : (
                <button onClick={handleResend} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
