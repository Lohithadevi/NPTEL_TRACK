import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-gray-200 dark:bg-slate-700 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
        <div className="w-28 h-9 bg-gray-200 dark:bg-slate-700 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

export default function MatchFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [requestState, setRequestState] = useState({});

  useEffect(() => {
    Promise.all([api.get('/posts'), api.get('/matches/sent')])
      .then(([postsRes, sentRes]) => {
        setPosts(postsRes.data);
        setFiltered(postsRes.data);
        const states = {};
        sentRes.data.forEach(r => {
          states[r.post?._id] = r.status === 'accepted' ? 'accepted' : 'sent';
        });
        setRequestState(states);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) return setFiltered(posts);
    setFiltered(posts.filter(p => p.destination.toLowerCase().includes(search.toLowerCase())));
  }, [search, posts]);

  const sendRequest = async (postId) => {
    setRequestState(prev => ({ ...prev, [postId]: 'loading' }));
    try {
      await api.post('/matches', { postId });
      setRequestState(prev => ({ ...prev, [postId]: 'sent' }));
    } catch (err) {
      const msg = err.response?.data?.message || '';
      setRequestState(prev => ({ ...prev, [postId]: msg === 'Already requested' ? 'sent' : 'error' }));
    }
  };

  const goToChat = async (postId) => {
    const res = await api.get('/matches/accepted');
    const room = res.data.find(r => r.post?._id === postId);
    if (room) navigate('/chats', { state: { roomId: room._id } });
    else navigate('/chats');
  };

  const batchColor = (batch) => {
    if (batch?.includes('Morning')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
    if (batch?.includes('Afternoon')) return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
  };

  const renderAction = (post) => {
    const state = requestState[post._id];
    if (state === 'accepted') return (
      <button onClick={() => goToChat(post._id)}
        className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Message
      </button>
    );
    if (state === 'sent') return (
      <span className="shrink-0 inline-flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 text-xs font-semibold px-4 py-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Requested
      </span>
    );
    if (state === 'loading') return (
      <span className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500">
        Sending...
      </span>
    );
    return (
      <button onClick={() => sendRequest(post._id)}
        className="shrink-0 inline-flex items-center gap-1.5 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Request to Join
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Trips</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Find students traveling to the same exam center as you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text"
            placeholder="Search by destination — type exactly as in your hall ticket..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 shadow-sm"
          />
          {search && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-xl p-14 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-slate-300 font-medium">{search ? `No trips found for "${search}"` : 'No open trips right now'}</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Be the first to post a trip for others to join.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <div key={post._id}
                className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-md dark:hover:border-slate-600 transition-all">
                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{post.examName}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${batchColor(post.departureTime)}`}>
                      {post.departureTime}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5">{post.destination}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(post.travelDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-gray-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      Posted by <span className="text-gray-700 dark:text-slate-300 font-medium">{post.creator?.name}</span>
                    </span>
                    <span className="text-gray-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{post.seatsAvailable} seat{post.seatsAvailable !== 1 ? 's' : ''} available</span>
                  </div>
                  {post.notes && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 italic">"{post.notes}"</p>}
                </div>

                {/* Action */}
                {renderAction(post)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
