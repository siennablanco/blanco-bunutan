import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../utils/audio';

export default function SoundEffectsToggle() {
  const [sfxEnabled, setSfxEnabled] = useState(true);

  const handleToggle = () => {
    const isNowActive = audioManager.toggleMute();
    setSfxEnabled(isNowActive);
    if (isNowActive) {
      audioManager.playPop();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleToggle}
        title={sfxEnabled ? "I-mute ang sound effects" : "I-on ang sound effects"}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold shadow-lg transition-all duration-200 transform active:scale-95 border ${
          sfxEnabled
            ? 'bg-white/95 text-slate-700 hover:text-red-600 border-slate-200 shadow-md'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}
      >
        {sfxEnabled ? (
          <>
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">Sound Effects ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold">Sound Muted</span>
          </>
        )}
      </button>
    </div>
  );
}
