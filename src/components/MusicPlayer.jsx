import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { audioManager } from '../utils/audio';

export default function MusicPlayer({ isPlaying, onToggle }) {
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioManager.setVolume(val);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* Volume slider popover */}
      {showVolumeSlider && (
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-red-200 flex items-center gap-2 animate-fadeIn text-xs">
          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-red-600 h-1.5 cursor-pointer"
          />
          <Volume2 className="w-3.5 h-3.5 text-red-600" />
        </div>
      )}

      {/* Main Music Button */}
      <button
        onClick={onToggle}
        title={isPlaying ? "I-pause ang Party Music" : "I-play ang Blanco Christmas Party Music! 🎶"}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full font-bold shadow-xl transition-all duration-300 transform active:scale-95 border-2 ${
          isPlaying
            ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white border-yellow-300 shadow-red-500/50 animate-pulse-slow'
            : 'bg-white/95 hover:bg-white text-slate-800 border-red-300 hover:text-red-600'
        }`}
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
            </span>
            <Disc className="w-5 h-5 animate-spin-slow text-yellow-200" />
            <span className="text-xs font-bold tracking-wide flex items-center gap-1">
              Christmas Carols ON 🔔
            </span>
          </>
        ) : (
          <>
            <Music className="w-5 h-5 text-red-600 animate-bounce" />
            <span className="text-xs font-bold tracking-wide">
              Christmas Songs 🎄
            </span>
          </>
        )}

        {/* Volume toggle button */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider(!showVolumeSlider);
          }}
          className="p-1 hover:bg-black/10 rounded-full transition-colors ml-1"
          title="Ayusin ang lakas ng tunog"
        >
          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </span>
      </button>
    </div>
  );
}
