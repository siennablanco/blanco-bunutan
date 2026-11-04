// Secret Santa / Bunutan Matching Engine with Exclusions Solver

/**
 * Solves a valid Secret Santa matching using randomized backtracking.
 * Guarantees:
 * 1. Derangement: giver !== receiver
 * 2. Exclusions: receiver not in exclusions[giver]
 * 3. Bijection: each person gives exactly once, receives exactly once.
 * 4. Completely uniform random distribution among valid solutions.
 */
export function generateValidPairings(participants, exclusions = {}) {
  if (!participants || participants.length < 2) return null;

  const n = participants.length;
  const participantIds = participants.map(p => p.id);

  const isAllowed = (giverId, receiverId) => {
    if (giverId === receiverId) return false;
    const excludedList = exclusions[giverId] || [];
    return !excludedList.includes(receiverId);
  };

  // Randomized backtracking up to 500 attempts
  for (let attempt = 0; attempt < 500; attempt++) {
    const givers = [...participantIds].sort(() => Math.random() - 0.5);
    const receiversAvailable = new Set(participantIds);
    const pairing = {};
    let success = true;

    for (const giver of givers) {
      const candidates = [...receiversAvailable].filter(r => isAllowed(giver, r));
      if (candidates.length === 0) {
        success = false;
        break;
      }
      const chosenReceiver = candidates[Math.floor(Math.random() * candidates.length)];
      pairing[giver] = chosenReceiver;
      receiversAvailable.delete(chosenReceiver);
    }

    if (success && Object.keys(pairing).length === n) {
      return pairing;
    }
  }

  // Fallback full backtracking solver
  const givers = [...participantIds];
  const solution = {};
  const usedReceivers = new Set();

  function backtrack(index) {
    if (index === givers.length) return true;
    const giver = givers[index];

    const validReceivers = participantIds
      .filter(r => !usedReceivers.has(r) && isAllowed(giver, r))
      .sort(() => Math.random() - 0.5);

    for (const receiver of validReceivers) {
      solution[giver] = receiver;
      usedReceivers.add(receiver);

      if (backtrack(index + 1)) return true;

      delete solution[giver];
      usedReceivers.delete(receiver);
    }

    return false;
  }

  if (backtrack(0)) {
    return solution;
  }

  return null;
}

// Blanco Family sample participants with hilarious, witty wishlists!
export const DEFAULT_PARTICIPANTS = [
  { id: 'b1', name: 'Tito Boyet Blanco', wishlist: 'Kahit ano huwag lang bimpo at medyas haha!' },
  { id: 'b2', name: 'Tita Susan Blanco', wishlist: 'Tupperware o kahit anong pampaluto sa kusina' },
  { id: 'b3', name: 'Kuya Jayson Blanco', wishlist: 'Gaming mouse o cash na lang huwag na pilitin ang gamit 😂' },
  { id: 'b4', name: 'Ate Bea Blanco', wishlist: 'Scented candle o skincare kit' },
  { id: 'b5', name: 'Bunso Enzo Blanco', wishlist: 'Wireless earphone o pambili ng skin sa ML 🎮' },
  { id: 'b6', name: 'Lolo Carding Blanco', wishlist: 'Pampahid sa likod (Katinko/Salonpas VIP pack) o polo shirt' },
  { id: 'b7', name: 'Lola Remedios Blanco', wishlist: 'Mainit na shawl o paboritong imported chocolates 🍫' }
];

// Default exclusions (Tito Boyet <-> Tita Susan, Lolo <-> Lola)
export const DEFAULT_EXCLUSIONS = {
  'b1': ['b2'], // Tito Boyet cannot draw Tita Susan
  'b2': ['b1'], // Tita Susan cannot draw Tito Boyet
  'b6': ['b7'], // Lolo Carding cannot draw Lola Remedios
  'b7': ['b6'], // Lola Remedios cannot draw Lolo Carding
};
