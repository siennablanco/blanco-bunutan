import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Shield, Shuffle, RefreshCw, Eye, EyeOff, 
  Copy, Check, AlertCircle, HeartHandshake, UserPlus, Gift, List, 
  Settings, KeyRound
} from 'lucide-react';
import { generateValidPairings } from '../utils/secretSanta';
import { audioManager } from '../utils/audio';

export default function OrganizerModal({
  isOpen,
  onClose,
  participants,
  setParticipants,
  exclusions,
  setExclusions,
  pairings,
  setPairings,
  drawnIds,
  setDrawnIds,
  eventName,
  setEventName,
  budgetNote,
  setBudgetNote,
  organizerPin,
  setOrganizerPin
}) {
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' | 'exclusions' | 'pairings' | 'settings'
  const [newName, setNewName] = useState('');
  const [newWishlist, setNewWishlist] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [selectedGiverForExclusion, setSelectedGiverForExclusion] = useState(participants[0]?.id || '');
  const [couplePersonA, setCouplePersonA] = useState('');
  const [couplePersonB, setCouplePersonB] = useState('');
  const [showMasterList, setShowMasterList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === organizerPin) {
      setIsAuthenticated(true);
      setPinError('');
      audioManager.playJingleChime();
    } else {
      setPinError('Maling PIN! Subukan muli.');
      audioManager.playPop();
    }
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newId = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const updated = [...participants, { id: newId, name: newName.trim(), wishlist: newWishlist.trim() }];
    setParticipants(updated);
    setNewName('');
    setNewWishlist('');
    setSuccessMessage(`Naidagdag si ${newName.trim()}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
    audioManager.playPop();
  };

  const handleBulkAdd = () => {
    if (!bulkNames.trim()) return;
    const lines = bulkNames.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newEntries = lines.map(name => ({
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name,
      wishlist: ''
    }));

    setParticipants([...participants, ...newEntries]);
    setBulkNames('');
    setShowBulkAdd(false);
    setSuccessMessage(`Matagumpay na naidagdag ang ${newEntries.length} na kalahok!`);
    setTimeout(() => setSuccessMessage(''), 3000);
    audioManager.playJingleChime();
  };

  const handleDeleteParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (!window.confirm(`Sigurado ka bang tanggalin si ${p?.name}?`)) return;

    setParticipants(participants.filter(x => x.id !== id));
    // Remove from exclusions
    const updatedExclusions = { ...exclusions };
    delete updatedExclusions[id];
    Object.keys(updatedExclusions).forEach(giver => {
      updatedExclusions[giver] = updatedExclusions[giver].filter(rId => rId !== id);
    });
    setExclusions(updatedExclusions);

    // If active pairings exist, clear or require re-shuffle
    if (pairings && (pairings[id] || Object.values(pairings).includes(id))) {
      setPairings(null);
      setDrawnIds([]);
      setErrorMessage('Tinanggal ang kalahok kaya na-reset ang lumang bunutan pairings.');
    }
    audioManager.playPop();
  };

  // Toggle exclusion for single giver and receiver
  const handleToggleExclusion = (giverId, receiverId) => {
    const current = exclusions[giverId] || [];
    let updated;
    if (current.includes(receiverId)) {
      updated = current.filter(id => id !== receiverId);
    } else {
      updated = [...current, receiverId];
    }
    setExclusions({
      ...exclusions,
      [giverId]: updated
    });
    audioManager.playPop();
  };

  // Quick Mag-asawa / Couple mutual exclusion helper
  const handleAddCoupleExclusion = () => {
    if (!couplePersonA || !couplePersonB || couplePersonA === couplePersonB) {
      alert('Pumili ng 2 magkaibang tao para sa mag-asawa exclusion.');
      return;
    }

    const currentA = exclusions[couplePersonA] || [];
    const currentB = exclusions[couplePersonB] || [];

    const updated = {
      ...exclusions,
      [couplePersonA]: Array.from(new Set([...currentA, couplePersonB])),
      [couplePersonB]: Array.from(new Set([...currentB, couplePersonA]))
    };

    setExclusions(updated);
    const pA = participants.find(p => p.id === couplePersonA)?.name;
    const pB = participants.find(p => p.id === couplePersonB)?.name;
    setSuccessMessage(`Bawal na magkabunutan sina ${pA} at ${pB} ❤️❌!`);
    setTimeout(() => setSuccessMessage(''), 3500);
    audioManager.playJingleChime();
  };

  // Generate / Shuffle pairings
  const handleGeneratePairings = () => {
    if (participants.length < 2) {
      setErrorMessage('Kailangan ng hindi bababa sa 2 kalahok para makapag-bunutan!');
      return;
    }

    setErrorMessage('');
    const solution = generateValidPairings(participants, exclusions);

    if (!solution) {
      setErrorMessage('❌ Hindi makabuo ng bunutan dahil sa sobrang daming exclusions! Subukang bawasan ang bawal mabunot.');
      return;
    }

    setPairings(solution);
    setDrawnIds([]);
    setSuccessMessage('🎉 Matagumpay na nabuo ang bagong Secret Santa Bunutan pool!');
    setTimeout(() => setSuccessMessage(''), 3500);
    audioManager.playFanfare();
  };

  // Reset all draws
  const handleResetDrawsOnly = () => {
    if (window.confirm('I-re-reset ba ang status ng mga nakabunot na? (Mananatili ang kasalukuyang pairings)')) {
      setDrawnIds([]);
      setSuccessMessage('Na-reset ang drawn status! Pwede nang bumunot muli ang lahat.');
      setTimeout(() => setSuccessMessage(''), 3000);
      audioManager.playPop();
    }
  };

  // Copy Master list
  const handleCopyMasterList = () => {
    if (!pairings) return;
    const text = participants.map(p => {
      const drawnId = pairings[p.id];
      const drawnPerson = participants.find(x => x.id === drawnId);
      return `${p.name} ➔ nabunot si ${drawnPerson?.name || '---'}`;
    }).join('\n');

    navigator.clipboard.writeText(`🎄 MASTER LIST NG BUNUTAN (${eventName}) 🎄\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // PIN change
  const handleChangePin = (e) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      alert('Maglagay ng kahit 4 digits o characters para sa bagong PIN.');
      return;
    }
    setOrganizerPin(newPinInput.trim());
    setNewPinInput('');
    setSuccessMessage('Matagumpay na napalitan ang Organizer PIN!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-red-500 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              👑
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-holiday font-bold tracking-wide">
                Organizer Dashboard
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Pamahalaan ang mga Kalahok, Exclusions, at Bunutan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-transform active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Organizer Passcode Required 🔒
            </h3>
            <p className="text-sm text-slate-600 max-w-sm">
              Ipasok ang Organizer PIN upang pamahalaan ang listahan at maiwasan ang pagsilip ng iba.
              <span className="block text-xs text-slate-400 mt-1">(Default PIN: 1234)</span>
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Ilagay ang PIN"
                className="w-full text-center text-2xl font-bold tracking-widest px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-600 font-semibold">{pinError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                Buksan ang Dashboard 🔓
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'participants'
                    ? 'border-red-600 text-red-600 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Mga Kalahok ({participants.length})
              </button>
              <button
                onClick={() => setActiveTab('exclusions')}
                className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'exclusions'
                    ? 'border-red-600 text-red-600 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                Exclusions (Bawal)
              </button>
              <button
                onClick={() => setActiveTab('pairings')}
                className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'pairings'
                    ? 'border-red-600 text-red-600 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                Bunutan Status
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-red-600 text-red-600 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="mx-4 mt-3 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mx-4 mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tab Contents */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

              {/* TAB 1: PARTICIPANTS */}
              {activeTab === 'participants' && (
                <div className="space-y-4">
                  {/* Single Add Form */}
                  <form onSubmit={handleAddParticipant} className="bg-red-50/70 p-3.5 rounded-2xl border border-red-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Magdagdag ng Kalahok
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBulkAdd(!showBulkAdd)}
                        className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1"
                      >
                        <List className="w-3.5 h-3.5" />
                        {showBulkAdd ? "Isahang Dagdag" : "Maramihang Dagdag (Bulk Add)"}
                      </button>
                    </div>

                    {!showBulkAdd ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Pangalan (hal. Tita Susan)"
                          className="px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newWishlist}
                            onChange={(e) => setNewWishlist(e.target.value)}
                            placeholder="Wishlist / Hint (optional)"
                            className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shrink-0 shadow-md transition-transform active:scale-95"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">
                          Mag-paste ng mga pangalan na pinaghihiwalay ng comma (,) o bawat linya:
                        </p>
                        <textarea
                          rows={4}
                          value={bulkNames}
                          onChange={(e) => setBulkNames(e.target.value)}
                          placeholder="Papa Bong, Mama Lita, Kuya Mark, Ate Sarah, Bunso..."
                          className="w-full p-3 text-sm font-semibold rounded-xl border-2 border-slate-300 focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400 shadow-inner leading-relaxed"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowBulkAdd(false)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkAdd}
                            className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow"
                          >
                            Idagdag Lahat 🎁
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Participants List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Pangalan at Wishlist</span>
                      <span>Aksyon</span>
                    </div>

                    {participants.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        Walang kalahok pa. Mag-add ng mga pangalan sa itaas! 🎄
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                        {participants.map((p, idx) => {
                          const excludedCount = (exclusions[p.id] || []).length;
                          return (
                            <div key={p.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="truncate">
                                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    {excludedCount > 0 && (
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                                        {excludedCount} bawal
                                      </span>
                                    )}
                                  </div>
                                  {p.wishlist ? (
                                    <p className="text-xs text-slate-500 truncate">
                                      🎁 {p.wishlist}
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-slate-400 italic">
                                      Walang wishlist
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteParticipant(p.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Tanggalin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: EXCLUSIONS */}
              {activeTab === 'exclusions' && (
                <div className="space-y-4">
                  {/* Quick Couple / Mag-asawa Pairing Tool */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-3.5 rounded-2xl border border-pink-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                      <HeartHandshake className="w-4 h-4 text-rose-600" />
                      Quick Setup: Mag-asawa / Mag-partner (Bawal Magkabunutan)
                    </div>
                    <p className="text-xs text-slate-600">
                      Piliin ang dalawang mag-partner upang hindi nila mabunot ang isa't isa nang sabay:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={couplePersonA}
                        onChange={(e) => setCouplePersonA(e.target.value)}
                        className="p-2 text-xs rounded-xl border border-rose-200 bg-white font-medium"
                      >
                        <option value="">Piliin ang Partner 1</option>
                        {participants.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <select
                        value={couplePersonB}
                        onChange={(e) => setCouplePersonB(e.target.value)}
                        className="p-2 text-xs rounded-xl border border-rose-200 bg-white font-medium"
                      >
                        <option value="">Piliin ang Partner 2</option>
                        {participants.filter(p => p.id !== couplePersonA).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCoupleExclusion}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-transform active:scale-95"
                      >
                        I-set Bawal Magkabunutan 🚫
                      </button>
                    </div>
                  </div>

                  {/* Individual Custom Exclusion Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Pumili ng kalahok para i-customize ang bawal niyang mabunot:
                      </label>
                    </div>

                    <select
                      value={selectedGiverForExclusion}
                      onChange={(e) => setSelectedGiverForExclusion(e.target.value)}
                      className="w-full p-2.5 text-sm font-bold text-red-700 bg-red-50/50 rounded-xl border border-red-200 focus:outline-none"
                    >
                      {participants.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Bawal mabunot: {(exclusions[p.id] || []).length} tao)
                        </option>
                      ))}
                    </select>

                    {selectedGiverForExclusion && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        <p className="text-xs text-slate-600 font-medium">
                          Sino ang <span className="font-bold text-red-600">BAWAL</span> mabunot ni{' '}
                          <span className="font-bold text-slate-900">
                            {participants.find(p => p.id === selectedGiverForExclusion)?.name}
                          </span>?
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto">
                          {participants
                            .filter(p => p.id !== selectedGiverForExclusion)
                            .map(target => {
                              const isExcluded = (exclusions[selectedGiverForExclusion] || []).includes(target.id);
                              return (
                                <button
                                  key={target.id}
                                  type="button"
                                  onClick={() => handleToggleExclusion(selectedGiverForExclusion, target.id)}
                                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                                    isExcluded
                                      ? 'bg-red-500 text-white border-red-600 shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <span className="truncate">{target.name}</span>
                                  {isExcluded ? (
                                    <span className="text-[10px] bg-red-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
                                      Bawal ✕
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 ml-1">Pwede ✓</span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PAIRINGS & STATUS */}
              {activeTab === 'pairings' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">
                        Kasalukuyang Katayuan ng Bunutan
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {pairings 
                          ? `${drawnIds.length} sa ${participants.length} kalahok ang nakabunot na`
                          : 'Hindi pa nakapag-shuffle o nakapag-generate ng bunutan pool.'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleGeneratePairings}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        {pairings ? "I-shuffle Ulit" : "Bumuo ng Bunutan 🎁"}
                      </button>
                    </div>
                  </div>

                  {/* Draw Progress Bar */}
                  {pairings && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Progress ng Bunutan</span>
                        <span>{Math.round((drawnIds.length / (participants.length || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div
                          className="bg-gradient-to-r from-red-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${(drawnIds.length / (participants.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Participant List Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 px-1">
                      <span>Sino na ang Nakabunot?</span>
                      {drawnIds.length > 0 && (
                        <button
                          onClick={handleResetDrawsOnly}
                          className="text-amber-700 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> I-reset ang Draws
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                      {participants.map(p => {
                        const hasDrawn = drawnIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              hasDrawn
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="font-bold">{p.name}</span>
                            {hasDrawn ? (
                              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Nakabunot na
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                🎁 Bubunot pa lang
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Organizer Secret Master List (with Reveal Protection) */}
                  {pairings && (
                    <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-red-600" />
                          Master List ng Lahat ng Pairings (Para sa Organizer lamang)
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowMasterList(!showMasterList)}
                            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                          >
                            {showMasterList ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {showMasterList ? "Itago" : "Ipakita"}
                          </button>
                          {showMasterList && (
                            <button
                              type="button"
                              onClick={handleCopyMasterList}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-black flex items-center gap-1 shadow-sm"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copied ? "Nakopya na!" : "Kopyahin"}
                            </button>
                          )}
                        </div>
                      </div>

                      {showMasterList ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                          {participants.map(p => {
                            const receiverId = pairings[p.id];
                            const receiver = participants.find(x => x.id === receiverId);
                            return (
                              <div key={p.id} className="py-1.5 flex justify-between items-center">
                                <span className="font-semibold text-slate-800">{p.name}</span>
                                <span className="text-slate-400">nabunot si ➔</span>
                                <span className="font-bold text-red-600">{receiver?.name || '---'}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Nakatago ang master list upang hindi masira ang sorpresa. I-click ang "Ipakita" kung kailangang tingnan para sa emergency backup.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  {/* Event Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Pangalan ng Okasyon o Pamilya</label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Hal. Dela Cruz Family Christmas Bunutan 2026 🎄"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Budget Note / Theme */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Panuntunan sa Regalo o Budget</label>
                    <input
                      type="text"
                      value={budgetNote}
                      onChange={(e) => setBudgetNote(e.target.value)}
                      placeholder="Hal. Budget: 300 petot (Bawal ang bimpo at picture frame!) 🎁"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Cloud DB Info */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 bg-slate-50 p-3 rounded-2xl text-xs text-slate-600">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      ☁️ Paalala sa Pag-save sa Vercel:
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Naka-save ito agad sa iyong browser. Para mai-save sa Cloud sa Vercel upang makita ng lahat ng kamag-anak sa ibang cellphone, i-click lamang ang <strong>Storage ➔ KV</strong> sa Vercel dashboard.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-red-600" />
                      Palitan ang Organizer PIN
                    </label>
                    <form onSubmit={handleChangePin} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={8}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Bagong PIN (Hal. 2026)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-red-500 focus:outline-none text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black"
                      >
                        I-save ang PIN
                      </button>
                    </form>
                    <p className="text-[11px] text-slate-400">
                      Kasalukuyang PIN: <span className="font-mono font-bold text-slate-600">{organizerPin}</span>
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Ligtas na naka-save sa iyong browser 💾
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95"
              >
                Tapos Na / Isara
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

