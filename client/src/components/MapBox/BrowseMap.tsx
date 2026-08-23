"use client"

import React, { useEffect, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import getPlaces from './API/getPlaces';
import { FaMapMarkerAlt, FaSearch, FaCheck, FaTimes, FaCompass } from "react-icons/fa";

interface BrowseMapProps {
  handleBrowseMap?: (event: any) => void;
}

const SAMPLE_VENUES = [
  { id: "v1", name: "Main Auditorium (Campus Hub)", lat: 26.5123, lng: 80.2329, category: "Tech & Keynote" },
  { id: "v2", name: "Innovation Lab & Workshop Center", lat: 26.5150, lng: 80.2350, category: "Workshops" },
  { id: "v3", name: "Open Air Amphitheatre", lat: 26.5110, lng: 80.2300, category: "Cultural Events" },
  { id: "v4", name: "Sports Complex Arena", lat: 26.5180, lng: 80.2390, category: "Tournaments" },
];

function BrowseMap({ handleBrowseMap }: BrowseMapProps) {
  const { location, handleLocation } = useLocation();

  const [coords, setCoords] = useState({
    latitude: 26.512339,
    longitude: 80.2329,
  });

  const [venueName, setVenueName] = useState(location?.name || "Main Auditorium, Kanpur");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState(SAMPLE_VENUES[0]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => console.log("Geolocation fallback active.")
      );
    }
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setVenueName(query);
    if (query.length > 2) {
      try {
        const places = await getPlaces(query);
        setSuggestions(places || []);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (s: any) => {
    setVenueName(s.place_name);
    setCoords({
      latitude: s.center[1],
      longitude: s.center[0],
    });
    setSuggestions([]);
  };

  const handleConfirmLocation = (e: React.MouseEvent) => {
    handleLocation({
      name: venueName || selectedVenue.name,
      latitude: coords.latitude,
      longitude: coords.longitude,
      selected: true,
    });
    if (handleBrowseMap) handleBrowseMap(e);
  };

  return (
    <div className="brutal-card w-full h-full bg-white border-4 border-black p-4 shadow-[8px_8px_0px_#000] flex flex-col justify-between relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-4 border-black pb-3 z-10 bg-white">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#00F0FF] border-2 border-black flex items-center justify-center font-black">
            <FaCompass />
          </span>
          <h3 className="font-heading font-black text-lg uppercase tracking-tight text-black">
            Interactive Venue & Navigation Explorer
          </h3>
        </div>
        {handleBrowseMap && (
          <button
            onClick={handleBrowseMap}
            className="brutal-btn bg-[#FF007A] text-white p-1.5 text-xs font-black"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative my-3 z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3 text-black text-xs" />
            <input
              type="text"
              placeholder="Search location or select campus venue..."
              value={venueName}
              onChange={handleSearchChange}
              className="w-full bg-[#F4F4F0] border-2 border-black pl-9 pr-3 py-2 font-bold text-xs outline-none"
            />
          </div>
          <button
            onClick={handleConfirmLocation}
            className="brutal-btn bg-[#00FF66] text-black px-4 py-2 text-xs font-black uppercase flex items-center gap-1 shrink-0"
          >
            <FaCheck /> Confirm
          </button>
        </div>

        {/* Suggestion Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute top-11 left-0 right-0 bg-white border-2 border-black brutal-shadow max-h-40 overflow-y-auto">
            {suggestions.map((s) => (
              <li
                key={s.id}
                onClick={() => handleSelectSuggestion(s)}
                className="p-2 text-xs font-bold border-b border-black hover:bg-[#FFE600] cursor-pointer"
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Interactive Canvas & Venue Picker Grid */}
      <div className="flex-1 border-2 border-black relative bg-[#F4F4F0] flex flex-col md:flex-row overflow-hidden min-h-[300px]">
        {/* Map Visualizer Placeholder / Leaflet iFrame View */}
        <div className="flex-1 relative bg-[#e5e3df] p-4 flex flex-col justify-between">
          <iframe
            title="Venue Map View"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.01}%2C${coords.latitude - 0.01}%2C${coords.longitude + 0.01}%2C${coords.latitude + 0.01}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
            className="absolute inset-0 border-none w-full h-full"
          />

          <div className="relative z-10 bg-white/90 border-2 border-black p-3 brutal-shadow-sm w-fit max-w-xs">
            <p className="text-[10px] font-black uppercase tracking-wider text-black bg-[#FFE600] px-1 py-0.5 w-fit">
              TARGET COORDINATES
            </p>
            <p className="font-extrabold text-xs text-black mt-1 truncate">
              {venueName}
            </p>
            <p className="text-[10px] font-mono text-black font-bold">
              Lat: {coords.latitude.toFixed(4)} | Lng: {coords.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Popular Venues Sidebar */}
        <div className="w-full md:w-64 bg-white border-t-2 md:border-t-0 md:border-l-2 border-black p-3 flex flex-col justify-between">
          <div>
            <h4 className="font-heading font-black text-xs uppercase border-b border-black pb-1 mb-2 text-black">
              Popular Event Venues
            </h4>
            <div className="space-y-2">
              {SAMPLE_VENUES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVenue(v);
                    setVenueName(v.name);
                    setCoords({ latitude: v.lat, longitude: v.lng });
                  }}
                  className={`w-full text-left p-2 border border-black text-xs font-bold transition-all ${
                    selectedVenue.id === v.id
                      ? "bg-[#FFE600] shadow-[2px_2px_0_#000]"
                      : "bg-[#F4F4F0] hover:bg-[#00F0FF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{v.name}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-black bg-white px-1 border border-black mt-1 inline-block">
                    {v.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirmLocation}
            className="brutal-btn bg-[#FFE600] text-black w-full py-2 text-xs font-black uppercase mt-3"
          >
            Attach Selected Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrowseMap;