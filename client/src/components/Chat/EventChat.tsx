'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaBullhorn } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth, usePolling, useSocketEvent } from '@/context/AuthContext';
import { errorMessage, eventsApi, type ChatMessage } from '@/lib/api';
import { formatTime } from '@/lib/format';

interface EventChatProps {
  eventId: string;
  /** Organisers can broadcast announcements that also notify attendees. */
  canAnnounce?: boolean;
  className?: string;
}

const TYPING_TIMEOUT_MS = 3000;
const POLL_MS = 4000;

export default function EventChat({ eventId, canAnnounce = false, className = 'h-[480px]' }: EventChatProps) {
  const { user, socket, realtime } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [announcement, setAnnouncement] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<Record<string, string>>({});
  const feedRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);

  const scrollToBottom = () => requestAnimationFrame(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight }));

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    eventsApi
      .messages(eventId)
      .then(({ items, hasMore: more }) => {
        setMessages(items);
        setHasMore(more);
        scrollToBottom();
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Join the event's realtime room while this panel is open (and again after reconnects).
  useEffect(() => {
    if (!socket) return;
    const join = () => socket.emit('event:join', eventId, () => {});
    join();
    socket.on('connect', join);
    return () => {
      socket.off('connect', join);
      socket.emit('event:leave', eventId);
    };
  }, [socket, eventId]);

  const appendMessages = (incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => [...prev, ...incoming.filter((m) => !prev.some((p) => p.id === m.id))]);
    scrollToBottom();
  };

  // Without a socket (serverless hosting), fetch anything newer than the last message.
  usePolling(
    () => {
      const last = messages[messages.length - 1];
      eventsApi
        .messages(eventId, last ? { after: last.createdAt } : {})
        .then(({ items }) => appendMessages(items))
        .catch(() => {});
    },
    POLL_MS,
    realtime === 'polling' && !loading
  );

  useSocketEvent<ChatMessage>('message:new', (message) => {
    if (message.event !== eventId) return;
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    setTyping((prev) => {
      const { [message.sender.id]: _, ...rest } = prev;
      return rest;
    });
    scrollToBottom();
  });

  useSocketEvent<{ eventId: string; user: { id: string; name: string } }>('event:typing', ({ eventId: id, user: who }) => {
    if (id !== eventId) return;
    setTyping((prev) => ({ ...prev, [who.id]: who.name }));
    setTimeout(() => {
      setTyping((prev) => {
        const { [who.id]: _, ...rest } = prev;
        return rest;
      });
    }, TYPING_TIMEOUT_MS);
  });

  async function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    const { items, hasMore: more } = await eventsApi.messages(eventId, { before: oldest.createdAt });
    setMessages((prev) => [...items, ...prev]);
    setHasMore(more);
  }

  function handleTyping(value: string) {
    setText(value);
    const now = Date.now();
    if (socket && now - lastTypingSent.current > TYPING_TIMEOUT_MS / 2) {
      socket.emit('event:typing', eventId);
      lastTypingSent.current = now;
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const sent = await eventsApi.sendMessage(eventId, { text: text.trim(), announcement });
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setText('');
      setAnnouncement(false);
      scrollToBottom();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const typingNames = Object.values(typing);

  return (
    <div className={`flex flex-col bg-white border-2 border-black ${className}`}>
      <div ref={feedRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F4F0]">
        {hasMore && (
          <button type="button" onClick={loadOlder} className="block mx-auto text-[11px] font-bold underline">
            Load earlier messages
          </button>
        )}
        {loading && <p className="text-xs font-bold">Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-xs font-bold text-center text-gray-600 py-8">
            No messages yet. Ask a question or say hi to the other attendees.
          </p>
        )}
        {messages.map((msg) => {
          if (msg.isAnnouncement) {
            return (
              <div key={msg.id} className="bg-[#FFE600] border-2 border-black p-3 text-xs font-bold">
                <p className="text-[10px] font-black uppercase flex items-center gap-1 mb-1">
                  <FaBullhorn /> Announcement · {msg.sender.name} · {formatTime(msg.createdAt)}
                </p>
                {msg.text}
              </div>
            );
          }
          const isMe = msg.sender.id === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase mb-1">
                <span>{isMe ? 'You' : msg.sender.name}</span>
                {msg.sender.role !== 'member' && !isMe && <span className="bg-black text-white px-1">{msg.sender.role}</span>}
                <span className="text-gray-500 font-mono">{formatTime(msg.createdAt)}</span>
              </div>
              <div
                className={`p-3 max-w-[85%] text-xs font-bold leading-relaxed border-2 border-black shadow-[3px_3px_0px_#000] whitespace-pre-wrap break-words ${
                  isMe ? 'bg-[#00F0FF]' : 'bg-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-5 px-3 text-[10px] font-bold text-gray-600 bg-white">
        {typingNames.length > 0 && `${typingNames.join(', ')} ${typingNames.length === 1 ? 'is' : 'are'} typing…`}
      </div>

      <form onSubmit={handleSend} className="bg-white border-t-2 border-black p-3 space-y-2">
        {canAnnounce && (
          <label className="flex items-center gap-2 text-[11px] font-black uppercase">
            <input type="checkbox" checked={announcement} onChange={(e) => setAnnouncement(e.target.checked)} />
            Send as announcement (notifies all attendees)
          </label>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Message everyone at this event…"
            value={text}
            maxLength={2000}
            onChange={(e) => handleTyping(e.target.value)}
            aria-label="Message"
            className="flex-1 bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Send"
            className="brutal-btn bg-[#00FF66] text-black px-4 py-2 text-xs font-black uppercase flex items-center justify-center disabled:opacity-60"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}
