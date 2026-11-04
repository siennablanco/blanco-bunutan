import confetti from 'canvas-confetti';

export function fireHolidayConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  // Christmas colors: Red, Gold, Green, White, Mint
  const holidayColors = ['#D42426', '#165B33', '#FBBF24', '#FFFFFF', '#10B981', '#E11D48'];

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: holidayColors
  });
  fire(0.2, {
    spread: 60,
    colors: holidayColors
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: holidayColors
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: holidayColors
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: holidayColors
  });
}

