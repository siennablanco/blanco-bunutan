import React, { useState, useEffect, useRef } from 'react';
import SnowEffect from './components/SnowEffect';
import SoundEffectsToggle from './components/MusicPlayer';
import DrawScreen from './components/DrawScreen';
import OrganizerModal from './components/OrganizerModal';
import { 
  DEFAULT_PARTICIPANTS, 
  DEFAULT_EXCLUSIONS, 
  generateValidPairings 
} from './utils/secretSanta';

const STORAGE_KEY_PREFIX = 'blanco_bunutan_2026_';

export default function App() {
  // State synchronized with central server & localStorage
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
      return 'Budget: 300 petot! Bawal bimpo, baso ng Nescafe, at photo album ha! 😂🎁';
    }
    return saved;
  });

  const [organizerPin, setOrganizerPin] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'organizer_pin') || '1234';
  });

  const [updatedAt, setUpdatedAt] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY_PREFIX + 'updated_at') || '0', 10);
  });

  const localUpdatedAtRef = useRef(updatedAt);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isServerSynced, setIsServerSynced] = useState(false);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'exclusions', JSON.stringify(exclusions));
  }, [exclusions]);

  useEffect(() => {
    if (pairings) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'pairings', JSON.stringify(pairings));
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'pairings');
    }
  }, [pairings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'drawn_ids', JSON.stringify(drawnIds));
  }, [drawnIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'event_name', eventName);
  }, [eventName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'budget_note', budgetNote);
  }, [budgetNote]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'organizer_pin', organizerPin);
  }, [organizerPin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'updated_at', updatedAt.toString());
    localUpdatedAtRef.current = updatedAt;
  }, [updatedAt]);

  // 1. CENTRAL SERVER REAL-TIME SYNC
  // Fetches live state from server without clobbering newer local edits!
  const fetchServerState = async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.participants) {
          // If server has a timestamp, only update if server is newer or equal!
          const serverTime = data.updatedAt || 0;
          if (serverTime >= localUpdatedAtRef.current) {
            localUpdatedAtRef.current = serverTime;
            setUpdatedAt(serverTime);
            setParticipants(data.participants);
            setExclusions(data.exclusions || {});
            if (data.pairings) setPairings(data.pairings);
            if (data.drawnIds) setDrawnIds(data.drawnIds);
            if (data.eventName) setEventName(data.eventName);
            if (data.budgetNote) setBudgetNote(data.budgetNote);
            if (data.organizerPin) setOrganizerPin(data.organizerPin);
            setIsServerSynced(true);
          } else if (serverTime === 0 && localUpdatedAtRef.current === 0) {
            // First time load with initial template
            setParticipants(data.participants);
            if (data.pairings) setPairings(data.pairings);
            if (data.drawnIds) setDrawnIds(data.drawnIds);
            setIsServerSynced(true);
          }
        }
      }
    } catch (e) {
      // Local storage active as fallback
    }
  };

  // Poll server every 2.5 seconds
  useEffect(() => {
    fetchServerState();

    const interval = setInterval(fetchServerState, 2500);
    const handleFocus = () => fetchServerState();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Broadcast state changes to server
  const syncToServer = async (payload) => {
    const now = Date.now();
    localUpdatedAtRef.current = now;
    setUpdatedAt(now);

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, updatedAt: now })
      });
    } catch (e) {
      console.warn('Sync to server failed:', e);
    }
  };

  // When someone draws: record locally and broadcast to server
  const handleParticipantDraw = async (giverId) => {
    if (!drawnIds.includes(giverId)) {
      const updated = [...drawnIds, giverId];
      setDrawnIds(updated);
      localStorage.setItem(STORAGE_KEY_PREFIX + 'drawn_ids', JSON.stringify(updated));

      const now = Date.now();
      localUpdatedAtRef.current = now;
      setUpdatedAt(now);

      try {
        await fetch('/api/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giverId, updatedAt: now })
        });
      } catch (e) {
        console.warn('Draw sync error:', e);
      }
    }
  };

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

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400/80 z-20 border-t border-white/5">
        <p>
          🎄 Merry Christmas, Blanco Family! Bawal sumilip, bawal swap, enjoy the party! 🎁
        </p>
      </footer>

      {/* Sound Effects Toggle Only (No Background Music!) */}
      <SoundEffectsToggle />

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
