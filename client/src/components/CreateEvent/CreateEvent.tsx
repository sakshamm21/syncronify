"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCalendarPlus, FaImage, FaCheck, FaTag } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from '@/context/LocationContext';
import { useEvent } from '@/context/EventContext';
import getPlaces from '../MapBox/API/getPlaces';

interface CreateEventProps {
  isCreateActive: boolean;
  handleCreateActive: (active: boolean) => void;
  handleBrowseMap: (event: any) => void;
  isAdmin?: boolean;
}

const CATEGORIES = ["Tech & Code", "Cultural", "Workshop", "Sports", "Meetup", "Conference"];

const CreateEvent: React.FC<CreateEventProps> = ({
  isCreateActive,
  handleCreateActive,
  handleBrowseMap,
  isAdmin = false,
}) => {
  const { createNewEvent } = useEvent();
  const { location, setLocation } = useLocation();

  const [category, setCategory] = useState("Tech & Code");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [eventDetail, setEventDetail] = useState({
    title: '',
    location: '',
    description: '',
    fromDate: new Date(),
    toDate: new Date(Date.now() + 2 * 3600 * 1000),
    imageUrl: '',
    organizationName: '',
  });

  useEffect(() => {
    if (location?.name) {
      setEventDetail((prev) => ({ ...prev, location: location.name }));
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventDetail((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputLocation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setEventDetail((prev) => ({ ...prev, location: query }));
    if (query.trim().length > 2) {
      try {
        const res = await getPlaces(query);
        setSuggestions(res || []);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectedSuggestion = (suggestion: any) => {
    setEventDetail((prev) => ({ ...prev, location: suggestion.place_name }));
    setLocation({
      name: suggestion.place_name,
      latitude: suggestion.center[1],
      longitude: suggestion.center[0],
      selected: true,
    });
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDetail.title.trim()) return;

    await createNewEvent({
      ...eventDetail,
      category,
      isAdmin,
    });

    handleCreateActive(false);
    setEventDetail({
      title: '',
      location: '',
      description: '',
      fromDate: new Date(),
      toDate: new Date(Date.now() + 2 * 3600 * 1000),
      imageUrl: '',
      organizationName: '',
    });
  };

  if (!isCreateActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="brutal-card w-full max-w-2xl bg-white border-4 border-black p-6 shadow-[10px_10px_0px_#000] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xl">
              <FaCalendarPlus />
            </span>
            <div>
              <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-black">
                {isAdmin ? "Post Official Event" : "Create Event"}
              </h2>
              <p className="text-xs font-bold text-black uppercase">
                {isAdmin ? "Public Organization Listing" : "Personal / Community Schedule"}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCreateActive(false)}
            className="brutal-btn bg-[#FF007A] text-white w-9 h-9 flex items-center justify-center font-black text-lg"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-black">
              Event Title <span className="text-[#FF007A]">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Neo-Brutalist Hackathon 2026"
              value={eventDetail.title}
              onChange={handleChange}
              className="w-full bg-[#F4F4F0] border-2 border-black p-3 font-bold text-sm outline-none focus:bg-white focus:shadow-[4px_4px_0px_#000] transition-all"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-black uppercase mb-2 text-black flex items-center gap-1">
              <FaTag /> Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`brutal-btn text-xs px-3 py-1.5 uppercase ${
                    category === cat ? "bg-[#FFE600] text-black" : "bg-[#F4F4F0] text-black hover:bg-[#00F0FF]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-black">
              Event Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Briefly describe what attendees will learn or experience..."
              value={eventDetail.description}
              onChange={handleChange}
              className="w-full bg-[#F4F4F0] border-2 border-black p-3 font-medium text-sm outline-none focus:bg-white focus:shadow-[4px_4px_0px_#000] transition-all"
            />
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFE600]/20 border-2 border-black p-4 brutal-shadow-sm">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-black">Starts At</label>
              <DatePicker
                selected={eventDetail.fromDate}
                onChange={(date) => date && setEventDetail((prev) => ({ ...prev, fromDate: date }))}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full bg-white border-2 border-black p-2 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-black">Ends At</label>
              <DatePicker
                selected={eventDetail.toDate}
                onChange={(date) => date && setEventDetail((prev) => ({ ...prev, toDate: date }))}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full bg-white border-2 border-black p-2 font-bold text-xs"
              />
            </div>
          </div>

          {/* Location & Map Trigger */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-black">
              Venue / Location
            </label>
            <div className="relative flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                name="location"
                placeholder="Search venue or address..."
                value={eventDetail.location}
                onChange={handleInputLocation}
                className="flex-1 bg-[#F4F4F0] border-2 border-black p-3 font-bold text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleBrowseMap}
                className="brutal-btn bg-[#00F0FF] text-black px-4 py-2 text-xs font-black uppercase flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt /> Pick Map Location
              </button>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <ul className="mt-1 bg-white border-2 border-black brutal-shadow-sm max-h-40 overflow-y-auto z-10">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleSelectedSuggestion(s)}
                    className="p-2 text-xs font-bold border-b border-black hover:bg-[#FFE600] cursor-pointer"
                  >
                    {s.place_name}
                  </li>
                ))}
              </ul>
            )}

            {location?.selected && (
              <p className="mt-1 text-[11px] font-extrabold text-[#00FF66] bg-black px-2 py-0.5 w-fit flex items-center gap-1">
                <FaCheck /> Coordinates attached ({location.latitude?.toFixed(3)}, {location.longitude?.toFixed(3)})
              </p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 text-black flex items-center gap-1">
              <FaImage /> Event Poster Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              value={eventDetail.imageUrl}
              onChange={handleChange}
              className="w-full bg-[#F4F4F0] border-2 border-black p-3 font-mono text-xs outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t-4 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => handleCreateActive(false)}
              className="brutal-btn bg-[#F4F4F0] text-black px-5 py-2.5 text-xs font-black uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="brutal-btn bg-[#00FF66] text-black px-6 py-2.5 text-xs font-black uppercase flex items-center gap-2"
            >
              <FaCalendarPlus /> Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;