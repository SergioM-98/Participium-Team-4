"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin, X } from "lucide-react";
import { LatLngExpression } from "leaflet";

interface AddressSearchProps {
  onLocationFound: (lat: number, lng: number) => void;
  selectedPosition?: LatLngExpression | null;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const TORINO_VIEWBOX = "7.5703,45.144,7.7783,45.0027";

export default function AddressSearch({
  onLocationFound,
  selectedPosition,
}: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // FIX: Ref to track if the update comes from a selection
  const isSelectionRef = useRef(false);

  // Update search bar when map is clicked
  useEffect(() => {
    if (selectedPosition) {
      let lat, lng;
      if (Array.isArray(selectedPosition)) {
        [lat, lng] = selectedPosition;
      } else {
        lat = selectedPosition.lat;
        lng = selectedPosition.lng;
      }
      // Map clicks are technically "selections", so we avoid triggering a search
      isSelectionRef.current = true;
      setQuery(`${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`);
      setShowSuggestions(false);
    }
  }, [selectedPosition]);

  // Handle clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Main Search Logic
  useEffect(() => {
    // 1. FIX: If this update was caused by selecting an item, skip the search
    if (isSelectionRef.current) {
      isSelectionRef.current = false; // Reset for next time
      return;
    }

    // Check if query is just coordinates (don't search for coordinates via API text search)
    const isCoordinate = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(query);

    if (isCoordinate || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&viewbox=${TORINO_VIEWBOX}&bounded=1&limit=5&addressdetails=1`;
        const response = await fetch(url);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    // 2. FIX: Set flag to true before updating state
    isSelectionRef.current = true;

    setQuery(suggestion.display_name.split(",")[0]);
    setShowSuggestions(false);
    onLocationFound(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-80 md:w-96 font-sans">
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
        <div className="pl-3 text-gray-400">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Only show suggestions if user types manually
            setShowSuggestions(true);
          }}
          onFocus={() => {
            // Optional: Re-open suggestions on focus if there is text
            if (suggestions.length > 0 && query.length >= 3)
              setShowSuggestions(true);
          }}
          placeholder="Search address or click map..."
          className="flex-1 px-3 py-3 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="pr-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[2000] animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-64 overflow-y-auto py-1">
            {suggestions.map((item) => (
              <li key={item.place_id}>
                <button
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors group"
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item.display_name.split(",")[0]}
                    </span>
                    <span className="text-xs text-gray-500 line-clamp-1">
                      {item.display_name.split(",").slice(1).join(",")}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3 py-1 bg-gray-50 border-t border-gray-100 flex justify-end">
            <span className="text-[10px] text-gray-400">
              Powered by OpenStreetMap
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
