'use client'

import React, { useState, useEffect } from 'react';
import { FaStickyNote, FaPlus, FaTrash, FaEdit, FaSearch, FaTag, FaCheck, FaBookmark } from 'react-icons/fa';

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
  pinned?: boolean;
}

const INITIAL_NOTES: Note[] = [
  {
    id: "note-1",
    title: "Hackathon Organizer Prep",
    content: "Finalize room bookings, set up main projector, test microphone setup, and print QR codes for venue registration.",
    tag: "Event Plan",
    createdAt: "2026-08-22",
    pinned: true,
  },
  {
    id: "note-2",
    title: "Keynote Speaker Agenda",
    content: "Dr. Aris Vance speaking on AI Agents at 11:00 AM. Ensure VIP lounge passes are handed over at 10:30 AM.",
    tag: "Speaker",
    createdAt: "2026-08-23",
    pinned: true,
  },
  {
    id: "note-3",
    title: "Catering Checklist",
    content: "Confirm vegan and gluten-free lunch boxes for 45 team delegates. Coffee machine refill scheduled at 2:00 PM.",
    tag: "Logistics",
    createdAt: "2026-08-23",
    pinned: false,
  },
];

const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syncronify_notes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return INITIAL_NOTES;
  });

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    tag: 'Event Plan',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncronify_notes', JSON.stringify(notes));
    }
  }, [notes]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNote.title?.trim()) return;

    if (currentNote.id) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === currentNote.id
            ? { ...n, title: currentNote.title!, content: currentNote.content || '', tag: currentNote.tag || 'Event Plan' }
            : n
        )
      );
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: currentNote.title,
        content: currentNote.content || '',
        tag: currentNote.tag || 'Event Plan',
        createdAt: new Date().toISOString().split('T')[0],
        pinned: false,
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setCurrentNote({ title: '', content: '', tag: 'Event Plan' });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || n.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const tags = ['ALL', 'Event Plan', 'Speaker', 'Logistics', 'Ideas', 'Personal'];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="brutal-card p-6 bg-[#FFFFFF] border-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#FF007A] text-white border-2 border-black flex items-center justify-center font-black">
              <FaStickyNote />
            </span>
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
              Notes & Execution Plans
            </h2>
          </div>
          <p className="text-xs font-bold text-black mt-1">
            Capture ideas, event agendas, and team meeting summaries in real time.
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentNote({ title: '', content: '', tag: 'Event Plan' });
            setIsEditing(true);
          }}
          className="brutal-btn bg-[#FFE600] text-black px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2 self-start md:self-auto"
        >
          <FaPlus /> New Note
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-black text-sm" />
          <input
            type="text"
            placeholder="Search notes by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border-2 border-black pl-10 pr-4 py-2.5 font-bold text-xs outline-none brutal-shadow-sm focus:bg-[#FFE600]/10"
          />
        </div>

        {/* Tag Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`brutal-btn text-[11px] px-3 py-1.5 uppercase ${
                selectedTag === t ? 'bg-[#00F0FF] text-black' : 'bg-white text-black hover:bg-[#FFE600]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Note Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="brutal-card w-full max-w-lg bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
            <h3 className="font-heading font-black text-xl uppercase mb-4 text-black border-b-2 border-black pb-2">
              {currentNote.id ? 'Edit Note' : 'Create New Note'}
            </h3>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Note header..."
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Tag / Category</label>
                <select
                  value={currentNote.tag}
                  onChange={(e) => setCurrentNote({ ...currentNote, tag: e.target.value })}
                  className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-bold text-xs outline-none"
                >
                  {tags.filter((t) => t !== 'ALL').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Content</label>
                <textarea
                  rows={4}
                  placeholder="Write your note body here..."
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  className="w-full bg-[#F4F4F0] border-2 border-black p-2.5 font-medium text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-black flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="brutal-btn bg-[#F4F4F0] text-black px-4 py-2 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutal-btn bg-[#00FF66] text-black px-5 py-2 text-xs uppercase flex items-center gap-1"
                >
                  <FaCheck /> Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full brutal-card p-10 bg-white border-2 border-black text-center">
            <p className="font-heading font-bold text-lg text-black">NO NOTES FOUND</p>
            <p className="text-xs font-medium text-black mt-1">
              Click "New Note" to record your event planning ideas.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`brutal-card brutal-card-hover p-5 flex flex-col justify-between ${
                note.pinned ? 'bg-[#FFE600]/20' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="brutal-badge bg-[#00F0FF] text-black">
                    {note.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={`p-1.5 border border-black text-xs ${
                        note.pinned ? 'bg-[#FF007A] text-white' : 'bg-white text-black'
                      }`}
                      title={note.pinned ? 'Unpin' : 'Pin note'}
                    >
                      <FaBookmark />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentNote(note);
                        setIsEditing(true);
                      }}
                      className="p-1.5 border border-black bg-white text-black text-xs hover:bg-[#FFE600]"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 border border-black bg-[#FF007A] text-white text-xs hover:bg-black"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <h3 className="font-heading font-extrabold text-lg text-black mb-2 leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs font-medium text-black leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-[10px] font-bold uppercase text-black">
                <span>Created {note.createdAt}</span>
                {note.pinned && <span className="bg-black text-white px-1.5 py-0.5">PINNED</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesManager;
