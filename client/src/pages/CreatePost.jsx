import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STEPS = [
  { label: 'Where?', desc: 'Destination & exam' },
  { label: 'When?', desc: 'Date & batch' },
  { label: 'Details', desc: 'Seats & notes' },
];

const BATCHES = [
  { label: 'Morning Batch', value: 'Morning Batch', hint: 'Before 12 PM', icon: '🌅' },
  { label: 'Afternoon Batch', value: 'Afternoon Batch', hint: '12 PM – 3 PM', icon: '☀️' },
  { label: 'Evening Batch', value: 'Evening Batch', hint: 'After 3 PM', icon: '🌆' },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ destination: '', examName: '', travelDate: '', departureTime: '', seatsAvailable: 1, notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/posts', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a Trip</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Let others know you're traveling — find your travel partner.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}>
                  {i < step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-semibold ${i <= step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{s.label}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${i < step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Destination City / Exam Center</label>
                  <input type="text" placeholder="Type exactly as in your hall ticket (e.g. Chennai, Coimbatore)"
                    value={form.destination} onChange={e => update('destination', e.target.value)}
                    className={inputClass} />
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">⚠️ Must match exactly with your hall ticket for accurate matching</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Exam / Event Name</label>
                  <input type="text" placeholder="e.g. NPTEL Python Programming, GATE 2025"
                    value={form.examName} onChange={e => update('examName', e.target.value)}
                    className={inputClass} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Travel Date</label>
                  <input type="date"
                    value={form.travelDate} onChange={e => update('travelDate', e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Exam Batch</label>
                  <div className="grid grid-cols-3 gap-3">
                    {BATCHES.map(b => (
                      <button type="button" key={b.value} onClick={() => update('departureTime', b.value)}
                        className={`flex flex-col items-center py-4 px-3 rounded-xl border-2 text-sm font-medium transition-all
                          ${form.departureTime === b.value
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'}`}>
                        <span className="text-2xl mb-1">{b.icon}</span>
                        <span className="font-semibold text-xs">{b.label}</span>
                        <span className="text-xs opacity-60 mt-0.5">{b.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Seats Available</label>
                  <div className="flex items-center gap-3">
                    {[1,2,3,4,5,6].map(n => (
                      <button type="button" key={n} onClick={() => update('seatsAvailable', n)}
                        className={`w-11 h-11 rounded-lg border-2 text-sm font-bold transition-all
                          ${form.seatsAvailable === n
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-blue-400'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Notes <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea rows={3} placeholder="e.g. Prefer train travel, open to splitting cab fare, meeting at bus stand..."
                    value={form.notes} onChange={e => update('notes', e.target.value)}
                    className={`${inputClass} resize-none`} />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Trip Summary</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900 dark:text-white"><span className="text-gray-500 dark:text-slate-400">Exam:</span> {form.examName}</p>
                    <p className="text-sm text-gray-900 dark:text-white"><span className="text-gray-500 dark:text-slate-400">To:</span> {form.destination}</p>
                    <p className="text-sm text-gray-900 dark:text-white"><span className="text-gray-500 dark:text-slate-400">Date:</span> {form.travelDate ? new Date(form.travelDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}</p>
                    <p className="text-sm text-gray-900 dark:text-white"><span className="text-gray-500 dark:text-slate-400">Batch:</span> {form.departureTime}</p>
                    <p className="text-sm text-gray-900 dark:text-white"><span className="text-gray-500 dark:text-slate-400">Seats:</span> {form.seatsAvailable}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-7 pt-5 border-t border-gray-100 dark:border-slate-700">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && (!form.destination || !form.examName)) || (step === 1 && (!form.travelDate || !form.departureTime))}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                {loading ? 'Posting...' : 'Publish Trip'}
                {!loading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
