import React, { useState, useEffect, useRef } from 'react';
import SnowEffect from './components/SnowEffect';
import MusicPlayer from './components/MusicPlayer';
import DrawScreen from './components/DrawScreen';
import OrganizerModal from './components/OrganizerModal';
import { 
  DEFAULT_PARTICIPANTS, 
  DEFAULT_EXCLUSIONS, 
  generateValidPairings 
} from './utils/secretSanta';
import { audioManager } from './utils/audio';

const STORAGE_KEY_PREFIX = 'blanco_bunutan_2026_';

export default function App() {
  // State synchronized with central server
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'participants');
    return saved ? JSON.parse(saved) : DEFAULT_PARTICIPANTS;
  });

  const [exclusions, setExclusions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'exclusions');
    return saved ? JSON.parse(saved) : DEFAULT_EXCLUSIONS;
  });

  const [pairings, setPairings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'pairings');
    if (saved) return JSON.parse(saved);
    return generateValidPairings(DEFAULT_PARTICIPANTS, DEFAULT_EXCLUSIONS);
  });

  const [drawnIds, setDrawnIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'drawn_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [eventName, setEventName] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'event_name') || 'Blanco Christmas Party 2026 🎄';
  });

  const [budgetNote, setBudgetNote] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'budget_note');
    if (!saved || saved.includes('500') || saved.toLowerCase().includes('kuripot') || saved.toLowerCase().includes('sweet') || saved.toLowerCase().includes('useful')) {
      return 'Budget: 300 petot! (Bawal ang bimpo, baso ng Nescafe, at picture frame!) 🎁💸';
    }
    return saved;
  });

  const [organizerPin, setOrganizerPin] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'organizer_pin') || '1234';
  });

  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isServerSynced, setIsServerSynced] = useState(false);

  // 1. CENTRAL SERVER REAL-TIME SYNC
  // Fetches live state from server and keeps all connected phones completely in sync!
  const fetchServerState = async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.participants) {
          setParticipants(data.participants);
          setExclusions(data.exclusions || {});
          if (data.pairings) setPairings(data.pairings);
          if (data.drawnIds) setDrawnIds(data.drawnIds);
          if (data.eventName) setEventName(data.eventName);
          if (data.budgetNote) setBudgetNote(data.budgetNote);
          if (data.organizerPin) setOrganizerPin(data.organizerPin);
          setIsServerSynced(true);

          // Update local cache
          localStorage.setItem(STORAGE_KEY_PREFIX + 'drawn_ids', JSON.stringify(data.drawnIds || []));
          localStorage.setItem(STORAGE_KEY_PREFIX + 'participants', JSON.stringify(data.participants));
          localStorage.setItem(STORAGE_KEY_PREFIX + 'pairings', JSON.stringify(data.pairings || {}));
        }
      }
    } catch (e) {
      // Fallback to local storage if offline
    }
  };

  // Poll server every 2 seconds so that when Device A draws, Device B sees it immediately!
  useEffect(() => {
    fetchServerState();

    const interval = setInterval(fetchServerState, 2200);
    const handleFocus = () => fetchServerState();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // When organizer makes changes, broadcast to central server
  const syncToServer = async (payload) => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Sync to server failed:', e);
    }
  };

  // 2. WHEN SOMEONE DRAWS: Immediately record on central server
  const handleParticipantDraw = async (giverId) => {
    if (!drawnIds.includes(giverId)) {
      const updated = [...drawnIds, giverId];
      setDrawnIds(updated);
      localStorage.setItem(STORAGE_KEY_PREFIX + 'drawn_ids', JSON.stringify(updated));

      // Post to central server so ALL other devices get it immediately
      try {
        await fetch('/api/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giverId })
        });
      } catch (e) {
        console.warn('Draw sync error:', e);
      }
    }
  };

  // Sync state to local storage and server on organizer edits
  const handleSetParticipants = (newVal) => {
    setParticipants(newVal);
    syncToServer({ participants: newVal });
  };

  const handleSetExclusions = (newVal) => {
    setExclusions(newVal);
    syncToServer({ exclusions: newVal });
  };

  const handleSetPairings = (newVal) => {
    setPairings(newVal);
    syncToServer({ pairings: newVal, drawnIds: [] });
  };

  const handleSetDrawnIds = (newVal) => {
    setDrawnIds(newVal);
    syncToServer({ drawnIds: newVal });
  };

  const handleSetEventName = (newVal) => {
    setEventName(newVal);
    syncToServer({ eventName: newVal });
  };

  const handleSetBudgetNote = (newVal) => {
    setBudgetNote(newVal);
    syncToServer({ budgetNote: newVal });
  };

  // 3. TRADITIONAL CHRISTMAS MUSIC AUTOPLAY
  useEffect(() => {
    // Attempt automatic playback immediately on mount
    try {
      audioManager.startMusic();
      setIsMusicPlaying(true);
    } catch (e) {
      // Handled on first user gesture below
    }

    // Modern browsers require 1 user gesture to unmute: attach global listener
    const startMusicOnFirstInteraction = () => {
      if (!audioManager.isPlaying) {
        audioManager.startMusic();
        setIsMusicPlaying(true);
      }
    };

    window.addEventListener('pointerdown', startMusicOnFirstInteraction, { once: true });
    window.addEventListener('touchstart', startMusicOnFirstInteraction, { once: true });
    window.addEventListener('click', startMusicOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startMusicOnFirstInteraction);
      window.removeEventListener('touchstart', startMusicOnFirstInteraction);
      window.removeEventListener('click', startMusicOnFirstInteraction);
    };
  }, []);

  const handleToggleMusic = () => {
    const active = audioManager.toggleMusic();
    setIsMusicPlaying(active);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0d1b2a] via-[#1b263b] to-[#0a1128] text-slate-100 flex flex-col justify-between selection:bg-red-500 selection:text-white">
      
      {/* Christmas Garland Lights on Top */}
      <ul className="christmas-lights" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <li key={i} />
        ))}
      </ul>

      {/* Snowfall Effect */}
      <SnowEffect />

      {/* Main Draw View */}
      <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-16 z-20">
        <DrawScreen
          participants={participants}
          pairings={pairings}
          drawnIds={drawnIds}
          onParticipantDraw={handleParticipantDraw}
          eventName={eventName}
          budgetNote={budgetNote}
          onOpenOrganizer={() => setIsOrganizerOpen(true)}
          isServerSynced={isServerSynced}
        />
      </main>

      {/* Footer without any mention of kuripot */}
      <footer className="text-center py-4 text-xs text-slate-400/80 z-20 border-t border-white/5 space-y-1">
        <p>
          🎄 Maligayang Pasko mula sa <strong>Blanco Family</strong>! 🎉 Bawal ang marites, walang silipan, at walang dayaan! 🎁
        </p>
        <p className="text-[10px] text-slate-500">
          Organizer PIN: <span className="text-slate-400 font-mono font-bold">{organizerPin}</span> (pindutin ang Organizer sa itaas para palitan)
        </p>
      </footer>

      {/* Traditional Christmas Carols Music Player */}
      <MusicPlayer isPlaying={isMusicPlaying} onToggle={handleToggleMusic} />

      {/* Organizer Modal */}
      <OrganizerModal
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        participants={participants}
        setParticipants={handleSetParticipants}
        exclusions={exclusions}
        setExclusions={handleSetExclusions}
        pairings={pairings}
        setPairings={handleSetPairings}
        drawnIds={drawnIds}
        setDrawnIds={handleSetDrawnIds}
        eventName={eventName}
        setEventName={handleSetEventName}
        budgetNote={budgetNote}
        setBudgetNote={handleSetBudgetNote}
        organizerPin={organizerPin}
        setOrganizerPin={setOrganizerPin}
      />
    </div>
  );
}
