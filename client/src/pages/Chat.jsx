import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import api from '../api';

export default function Chat() {
  const { user, setUnreadCount } = useAuth();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [unreadMap, setUnreadMap] = useState({});
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    socket.emit('register', user.id);
    Promise.all([api.get('/matches/accepted'), api.get('/matches/unread/rooms')])
      .then(([roomsRes, unreadRes]) => {
        setRooms(roomsRes.data);
        setUnreadMap(unreadRes.data);
        const targetId = location.state?.roomId;
        if (targetId) {
          const room = roomsRes.data.find(r => r._id === targetId);
          if (room) handleOpenRoom(room);
        }
      });
  }, [location.state]);

  useEffect(() => {
    const handleUnread = () => {
      api.get('/matches/unread/rooms').then(res => setUnreadMap(res.data));
    };
    socket.on('unreadCount', handleUnread);
    return () => socket.off('unreadCount', handleUnread);
  }, []);

  const handleOpenRoom = (room) => {
    setActiveRoom(room);
    setUnreadMap(prev => ({ ...prev, [room._id]: 0 }));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!activeRoom) return;
    socket.emit('joinRoom', activeRoom._id);
    api.get(`/matches/chat/${activeRoom._id}`).then(res => {
      setMessages(res.data);
      api.get('/matches/unread').then(r => setUnreadCount(r.data.count));
      setUnreadMap(prev => ({ ...prev, [activeRoom._id]: 0 }));
    });
    const handleMessage = (msg) => {
      if (msg.roomId === activeRoom._id) {
        setMessages(prev => [...prev, msg]);
        socket.emit('markRead', { roomId: activeRoom._id, userId: user.id });
      }
    };
    socket.on('receiveMessage', handleMessage);
    return () => {
      socket.off('receiveMessage', handleMessage);
      socket.emit('leaveRoom', activeRoom._id);
    };
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit('sendMessage', { roomId: activeRoom._id, senderId: user.id, senderName: user.name, text });
    setText('');
  };

  const getPartner = (room) => room.post?.creator?._id === user.id ? room.requester : room.post?.creator;

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const key = new Date(msg.createdAt).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-56px)] bg-gray-50 dark:bg-[#0f172a] flex">

      {/* Sidebar */}
      <div className="w-72 shrink-0 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Messages</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{rooms.length} conversation{rooms.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">No accepted matches yet</p>
            </div>
          ) : rooms.map(room => {
            const partner = getPartner(room);
            const unread = unreadMap[room._id] || 0;
            const isActive = activeRoom?._id === room._id;
            return (
              <button key={room._id} onClick={() => handleOpenRoom(room)}
                className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-slate-700/50
                  ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/40'}`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {partner?.name?.charAt(0).toUpperCase()}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {partner?.name || 'Partner'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{room.post?.examName} · {room.post?.destination}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-slate-300 font-semibold">Select a conversation</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Choose a chat from the left to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700 px-5 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {getPartner(activeRoom)?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{getPartner(activeRoom)?.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{activeRoom.post?.examName} → {activeRoom.post?.destination} · {activeRoom.post?.departureTime}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-medium px-2">{formatDate(msgs[0].createdAt)}</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                  </div>
                  <div className="space-y-2">
                    {msgs.map((msg, i) => {
                      const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
                              {msg.sender?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`max-w-sm ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                              ${isMe
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-bl-sm shadow-sm'}`}>
                              {msg.text}
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 px-1">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-slate-700 px-4 py-3">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <input ref={inputRef}
                  value={text} onChange={e => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                />
                <button type="submit" disabled={!text.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-slate-500 rounded-xl flex items-center justify-center transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
