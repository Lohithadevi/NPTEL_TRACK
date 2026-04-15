import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/posts/my'), api.get('/matches/incoming')])
      .then(([postsRes, matchRes]) => {
        setMyPosts(postsRes.data);
        setIncoming(matchRes.data.filter(r => r.status === 'pending'));
      })
      .finally(() => setLoading(false));
  }, []);

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/posts/${id}`);
      setMyPosts(prev => prev.filter(p => p._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAction = async (id, status) => {
    await api.put(`/matches/${id}`, { status });
    setIncoming(prev => prev.filter(r => r._id !== id));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* Page header */}
      <div className="bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{greeting()},</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{user.name}</h1>
          </div>
          <Link to="/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Trip
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Posts', value: myPosts.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Open Trips', value: myPosts.filter(p => p.status === 'open').length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Join Requests', value: incoming.length, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'Closed Trips', value: myPosts.filter(p => p.status === 'closed').length, color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-100 dark:bg-slate-800' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-transparent`}>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Join Requests — left col */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Join Requests</h2>
                {incoming.length > 0 && (
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {incoming.length} pending
                  </span>
                )}
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />)}
                </div>
              ) : incoming.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">No pending requests</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {incoming.map(r => (
                    <div key={r._id} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                          {r.requester?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.requester?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{r.requester?.email}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{r.post?.examName} → {r.post?.destination}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(r._id, 'accepted')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                          Accept
                        </button>
                        <button onClick={() => handleAction(r._id, 'rejected')}
                          className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold py-2 rounded-lg transition-colors">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Posts — right col */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">My Travel Posts</h2>
                <Link to="/create" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">+ New post</Link>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />)}
                </div>
              ) : myPosts.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">No trips posted yet</p>
                  <Link to="/create" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline">Post your first trip →</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {myPosts.map(post => (
                    <div key={post._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{post.examName}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            {post.destination} &nbsp;·&nbsp; {new Date(post.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &nbsp;·&nbsp; {post.departureTime}
                          </p>
                          {post.notes && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate italic">"{post.notes}"</p>}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full
                        ${post.status === 'open'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {post.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingId === post._id}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
                        {deletingId === post._id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
