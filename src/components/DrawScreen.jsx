import React, { useState } from 'react';
import { 
  Gift, Sparkles, CheckCircle2, ChevronRight, Lock, 
  ShieldCheck, Crown, Search, PartyPopper, Smile, Laugh
} from 'lucide-react';
import { fireHolidayConfetti } from '../utils/confetti';
import { audioManager } from '../utils/audio';

export default function DrawScreen({
  participants,
  pairings,
  drawnIds,
  onParticipantDraw,
  eventName,
  budgetNote,
  onOpenOrganizer
}) {
  const [selectedGiverId, setSelectedGiverId] = useState('');
  const [isConfirmingGiver, setIsConfirmingGiver] = useState(false);
  const [isDrawingAnimation, setIsDrawingAnimation] = useState(false);
  const [revealedResult, setRevealedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');

  const selectedGiver = participants.find(p => p.id === selectedGiverId);
  const hasAlreadyDrawn = selectedGiverId && drawnIds.includes(selectedGiverId);

  // Filtered & Alphabetically Sorted participants list (A to Z)
  const filteredParticipants = [...participants]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const remainingToDraw = participants.filter(p => !drawnIds.includes(p.id)).length;

  // Handle selecting a name
  const handleSelectPerson = (person) => {
    audioManager.playPop();
    setSelectedGiverId(person.id);

    if (drawnIds.includes(person.id)) {
      // Already drawn: strictly locked to prevent snooping!
      setIsConfirmingGiver(false);
    } else {
      // Not yet drawn, ask confirmation
      setIsConfirmingGiver(true);
    }
  };

  // Confirm identity and trigger draw
  const handleStartDraw = () => {
    if (!pairings || !pairings[selectedGiverId]) {
      alert('Wait lang! Hindi pa na-shuffle ang bunutan. Paki-pindot muna kay Organizer 👑 ang settings sa taas para mag-shuffle!');
      return;
    }

    setIsConfirmingGiver(false);
    setIsDrawingAnimation(true);

    // Play fun suspense drumroll
    audioManager.playDrumRoll(2.5);

    // Suspense animation before revealing
    setTimeout(() => {
      const drawnReceiverId = pairings[selectedGiverId];
      const drawnPerson = participants.find(p => p.id === drawnReceiverId);

      setRevealedResult(drawnPerson);
      setIsDrawingAnimation(false);

      // Mark as drawn in parent state
      onParticipantDraw(selectedGiverId);

      // Play fanfare & celebrate with confetti!
      audioManager.playFanfare();
      fireHolidayConfetti();
    }, 2500);
  };

  // Pass phone to next family member (Single device mode)
  const handlePassToNext = () => {
    const prevName = selectedGiver?.name;
    audioManager.playJingleChime();
    setRevealedResult(null);
    setSelectedGiverId('');
    setIsConfirmingGiver(false);

    setFeedbackToast(`Ayan safe na, ${prevName}! Ipasa mo na sa next na bubunot bago ka pa magpahalata! 😂📱`);
    setTimeout(() => setFeedbackToast(''), 4500);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-12 z-50 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center gap-2.5 animate-bounce text-sm font-bold text-center max-w-md mx-3">
          <PartyPopper className="w-5 h-5 shrink-0 text-yellow-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="w-full text-center space-y-2 mb-6">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-800/50 border border-red-500/40 text-yellow-200 text-xs font-bold rounded-full backdrop-blur-md">
            <span>🍗</span> Walang silipan, bawal cheater! 👀
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold rounded-full backdrop-blur-md" title="Naka-sync ang bunutan sa lahat ng devices!">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Sync 🔄
          </span>
        </div>

          <button
            onClick={onOpenOrganizer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-xs rounded-full shadow-lg transition-transform active:scale-95 border-2 border-yellow-200"
          >
            <Crown className="w-3.5 h-3.5 text-amber-900" />
            Organizer Settings
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-holiday font-bold text-white drop-shadow-md tracking-wider">
          {eventName || "Blanco Christmas Party 2026 🎄"}
        </h1>

        {budgetNote && (
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-yellow-300/40 text-xs sm:text-sm text-yellow-200 font-bold shadow-inner">
            {budgetNote}
          </div>
        )}

        <div className="text-xs text-emerald-200 font-bold">
          {remainingToDraw === 0 ? (
            <span className="text-yellow-300 font-extrabold animate-pulse text-sm">
              🎉 Complete na ang bunutan! Videoke at kainan na, mamaya na ang regalo! 🎤🍻
            </span>
          ) : (
            <span>
              🚨 <strong>{remainingToDraw}</strong> na lang ang 'di pa nakakabunot! Bilisan niyo baka maubos ang shanghai! 🍗 ({drawnIds.length}/{participants.length} done)
            </span>
          )}
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-4 border-red-500/80 p-5 sm:p-7 relative overflow-hidden transition-all duration-300">
        
        {/* Festive Top Ribbon Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-green-600"></div>

        {/* =========================================================================
            STATE 1: SUSPENSE DRAWING ANIMATION (FUNNY & DRAMATIC)
           ========================================================================= */}
        {isDrawingAnimation && (
          <div className="py-8 text-center space-y-6 animate-fadeIn">
            <div className="relative inline-block">
              {/* Shaking gift box */}
              <div className="text-8xl animate-gift-shake filter drop-shadow-xl select-none">
                🎁
              </div>
              <div className="absolute -top-3 -right-3 text-3xl animate-spin-slow">
                ✨
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-holiday font-bold text-red-600 tracking-wide">
                🥁 Huminga ka muna nang malalim...
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-bold animate-pulse">
                "Lord, sana madaling regaluhan 'tong mabubunot ko... 'wag po sana yung mapili!" 🙏😂
              </p>
            </div>

            <div className="w-56 mx-auto bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300">
              <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 h-full w-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: REVEALED RESULT (TADHANA NA ANG PUMILI - WITTY & FUNNY)
           ========================================================================= */}
        {!isDrawingAnimation && revealedResult && (
          <div className="py-4 text-center space-y-5 animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-yellow-900 text-xs font-extrabold uppercase tracking-wider animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
              Tadhana na 'to, bawal swap! ✨
            </div>

            <div className="text-slate-700 text-sm font-semibold">
              O eto na <span className="font-extrabold text-slate-900 text-base">{selectedGiver?.name}</span>, ang nabunot mo ay si:
            </div>

            {/* Glowing Big Celebratory Name Card */}
            <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 transform scale-100 hover:scale-[1.02] transition-transform gold-glow relative">
              <span className="absolute -top-4 -right-2 text-3xl animate-bounce">
                🎉
              </span>
              <span className="absolute -bottom-3 -left-2 text-3xl">
                🎄
              </span>

              <div className="text-xs uppercase tracking-widest text-yellow-200 font-bold mb-1">
                Your Monito / Monita 🎁
              </div>
              <div className="text-3xl sm:text-5xl font-holiday font-bold tracking-wide drop-shadow-lg text-yellow-300 py-1">
                {revealedResult.name}
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 bg-black/15 rounded-2xl p-3 text-xs sm:text-sm text-amber-100">
                <span className="font-bold text-yellow-200 block mb-0.5">💡 Request / Wishlist:</span>
                {revealedResult.wishlist ? (
                  <span className="italic font-medium">"{revealedResult.wishlist}"</span>
                ) : (
                  <span className="italic font-medium">"Walang nilagay na wishlist... bahala ka na sa diskarte mo haha."</span>
                )}
              </div>
            </div>

            {/* Comedic Warnings */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1 text-left">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-800">
                <span>🤫</span>
                <span>IMPORTANT RULES (WALANG BASAGAN NG TRIP):</span>
              </div>
              <p className="text-slate-600 pl-5">
                • Bawal sumimangot o magpalit kahit 'di mo bet ang nabunot mo haha! 😂<br />
                • ₱300 budget lang ha. Bawal bimpo, baso ng Nescafe, o picture frame! 🎁<br />
                • Act natural pagbalik sa sala para 'di mahalata kung sino nabunot mo!
              </p>
            </div>

            {/* PASS PHONE BUTTON - CRITICAL FOR 1 PHONE FAMILY SHARING */}
            <div className="pt-2">
              <button
                onClick={handlePassToNext}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ring-4 ring-emerald-300/50"
              >
                <span>📱</span>
                <span>Tapos na ko, pass the phone na!</span>
                <ChevronRight className="w-5 h-5 shrink-0" />
              </button>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Pagpindot mo, kusa 'tong itatago para safe ibigay sa next na bubunot nang walang silipan.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: CONFIRMING IDENTITY ("Ikaw ba talaga si [NAME]?")
           ========================================================================= */}
        {!isDrawingAnimation && !revealedResult && isConfirmingGiver && selectedGiver && (
          <div className="py-4 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full mx-auto flex items-center justify-center text-3xl shadow-inner">
              🎅👀
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-slate-800">
                Sure ka ikaw si <span className="text-red-600 font-extrabold">{selectedGiver.name}</span>?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-medium">
                Walang identity theft please! Siguraduhing walang nakatayo sa likod mo na nakiki-usyoso 👀
              </p>
            </div>

            <div className="space-y-2.5 pt-2 max-w-sm mx-auto">
              <button
                onClick={handleStartDraw}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-base rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ring-4 ring-red-200"
              >
                <Gift className="w-5 h-5 text-yellow-300" />
                Ako nga 'to, bunot na! 🎁
              </button>

              <button
                onClick={() => {
                  setSelectedGiverId('');
                  setIsConfirmingGiver(false);
                }}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                Wait lang, maling tao napindot ko 😅
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: ALREADY DRAWN SCREEN (STRICT PRIVACY: BAWAL ANG MARITES!)
           ========================================================================= */}
        {!isDrawingAnimation && !revealedResult && !isConfirmingGiver && hasAlreadyDrawn && selectedGiver && (
          <div className="py-6 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner text-3xl">
              🙈🔒
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Nakabunot ka na kanina pa! ✔️
              </div>

              <h3 className="text-2xl font-extrabold text-slate-800">
                Hoy <span className="text-emerald-700">{selectedGiver.name}</span>, tapos ka na bumunot! 🎄
              </h3>

              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-600 space-y-2 text-left">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>NAKA-LOCK NA ANG RESULT</span>
                </div>
                <p>
                  Para iwas dulas at walang silipan sa pamilya, hindi na 'to pwedeng buksan ulit dito.
                </p>
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200 font-medium">
                  💡 <em>Nakalimutan mo talaga kung sino nabunot mo? Lambingin mo si <strong>Organizer 👑</strong> para pabulong na i-check sa master list haha!</em>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedGiverId('')}
                className="w-full max-w-xs mx-auto py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Bumalik sa listahan ↩️</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 5: DEFAULT LIST OF PARTICIPANTS ("Piliin ang Pangalan Mo")
           ========================================================================= */}
        {!isDrawingAnimation && !revealedResult && !isConfirmingGiver && !hasAlreadyDrawn && (
          <div className="space-y-4">
            
            {/* Instruction title */}
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Gift className="w-4 h-4" /> Step 1: Hanapin mo name mo dito (A to Z) 🔤
              </span>
              <h2 className="text-2xl font-bold text-slate-800">
                Sino ka diyan? Piliin mo sarili mo 👇
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pindutin ang sarili mong pangalan. Bawal magpanggap na si bunso para makabunot ulit ha! 😂
              </p>
            </div>

            {/* Quick search input */}
            {participants.length > 5 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search mo name mo dito..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border-2 border-slate-300 bg-white focus:border-red-400 focus:outline-none font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Name grid / cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredParticipants.map(person => {
                const isDrawn = drawnIds.includes(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => handleSelectPerson(person)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group transform active:scale-98 ${
                      isDrawn
                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50'
                        : 'bg-white border-red-200 hover:border-red-500 hover:shadow-md hover:bg-red-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isDrawn 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-red-100 text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors'
                      }`}>
                        {isDrawn ? <CheckCircle2 className="w-5 h-5" /> : '🎁'}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-sm text-slate-800 truncate flex items-center gap-1.5">
                          <span>{person.name}</span>
                          {isDrawn && (
                            <Lock className="w-3 h-3 text-emerald-700 shrink-0" title="Protektado ang resulta" />
                          )}
                        </div>

                        {/* Status text under name */}
                        <div className="text-[11px] font-semibold">
                          {isDrawn ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5">
                              ✓ Nakabunot na (Bawal swap ha)
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold group-hover:underline">
                              👉 Ikaw na bunot, 'wag kabahan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isDrawn ? (
                        <span className="text-[10px] text-emerald-800 font-bold bg-white border border-emerald-200 px-2 py-1 rounded-lg shadow-2xs">
                          Locked 🔒
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* No Pairing alert if pool isn't generated yet */}
            {(!pairings || Object.keys(pairings).length === 0) && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-center justify-between gap-2">
                <span>
                  ⚠️ Paalala kay Organizer: Paki-shuffle muna sa <strong>Organizer Settings</strong> sa itaas bago bumunot.
                </span>
                <button
                  onClick={onOpenOrganizer}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold shrink-0 text-[11px]"
                >
                  Bumuo Na
                </button>
              </div>
            )}

            {/* Privacy security note banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-start gap-2">
              <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Silip Rule:</strong> Naka-lock agad ang result pagkabunot para walang spoiler. Kapag nakalimutan mo kung sino nabunot mo, pabulong ka na lang kay <strong>Organizer 👑</strong>!
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
