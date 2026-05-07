// ──────────────────────────────────────────────────────────────────────────────
// REALISTIC 4-PHASE INK DRIP SVG PATH GENERATOR
// Used for SVG clipPath transitions (objectBoundingBox coordinates: 0–1)
//
// Phase 1 (0.00–0.15): Edge Formation — flat → wavy bumps seed
// Phase 2 (0.15–0.45): Drip Extension — bumps stretch downward asymmetrically  
// Phase 3 (0.45–0.70): Stretch & Break — thin necks, bulging tips, detached drops
// Phase 4 (0.70–1.00): Full Cover — liquid floods entire viewport
// ──────────────────────────────────────────────────────────────────────────────

// Seeded PRNG for deterministic layout across renders
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);

interface DripSeed {
  cx: number;
  speed: number;
  width: number;
  delay: number;
  bulge: number;
  lean: number;
  hasDrop: boolean;
  dropDelay: number;
  dropSpeed: number;
}

const DRIP_COUNT = 16;
const DRIPS: DripSeed[] = Array.from({ length: DRIP_COUNT }, (_, i) => {
  const cx = (i + 0.3 + rng() * 0.4) / DRIP_COUNT;
  return {
    cx: Math.min(0.97, Math.max(0.03, cx)),
    speed: 0.6 + rng() * 1.4,
    width: 0.012 + rng() * 0.025,
    delay: rng() * 0.12,
    bulge: 0.5 + rng() * 1.2,
    lean: (rng() - 0.5) * 0.4,
    hasDrop: rng() > 0.55,
    dropDelay: 0.55 + rng() * 0.15,
    dropSpeed: 1.5 + rng() * 2.0,
  };
});

function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function inkEase(t: number): number {
  if (t < 0.3) return 2.5 * t * t;
  if (t < 0.7) return 0.225 + (t - 0.3) * 1.4375;
  return 1 - 1.5 * (1 - t) * (1 - t);
}

const f = (n: number) => n.toFixed(5);

export function buildInkPath(progress: number): string {
  if (progress <= 0) return "";
  
  const p = Math.min(1, Math.max(0, progress));
  
  // Phase progress values
  const phase1 = smoothStep(0, 0.15, p);
  const phase2 = smoothStep(0.12, 0.45, p);
  const phase4 = smoothStep(0.65, 1.0, p);
  
  // Main curtain Y position (0–1 normalized)
  const curtainY = inkEase(p) * 1.15;

  // ═══════════════════════════════════
  // MAIN CURTAIN with wavy edge
  // ═══════════════════════════════════
  const segments = 80;
  let path = `M 1,0 L 0,0 L 0,${f(curtainY)}`;

  // Build wave points (left to right)
  const wavePoints: { x: number; y: number }[] = [];
  for (let s = 0; s <= segments; s++) {
    const ratio = s / segments;
    
    const freq1 = Math.sin(ratio * Math.PI * 3.7 + p * 2.1);
    const freq2 = Math.sin(ratio * Math.PI * 7.3 + p * 3.8) * 0.5;
    const freq3 = Math.sin(ratio * Math.PI * 13.1 + p * 5.2) * 0.25;
    const freq4 = Math.sin(ratio * Math.PI * 19.7 + p * 1.3) * 0.12;
    
    const bumpAmplitude = phase1 * 0.015 * (1 - phase4 * 0.8);
    const bump = (freq1 + freq2 + freq3 + freq4) * bumpAmplitude;
    
    wavePoints.push({ x: ratio, y: curtainY + bump });
  }

  // Draw wave edge from left to right
  for (let i = 0; i < wavePoints.length; i++) {
    const pt = wavePoints[i];
    if (i === 0) {
      path += ` L ${f(pt.x)},${f(pt.y)}`;
    } else {
      const prev = wavePoints[i - 1];
      const cpX = (prev.x + pt.x) / 2;
      const cpY = (prev.y + pt.y) / 2;
      path += ` Q ${f(prev.x)},${f(prev.y)} ${f(cpX)},${f(cpY)}`;
    }
  }
  
  // Close the right side
  path += ` L 1,${f(curtainY)} L 1,0 Z`;

  // ═══════════════════════════════════
  // DRIPS (Phase 2 & 3)
  // ═══════════════════════════════════
  if (phase2 > 0 && phase4 < 0.98) {
    for (const drip of DRIPS) {
      const dripP = Math.max(0, Math.min(1, (p - drip.delay) * drip.speed));
      if (dripP <= 0.02) continue;

      const cx = drip.cx;
      const baseW = drip.width;

      // Wave Y at drip position
      const waveIdx = Math.round(drip.cx * segments);
      const waveY = wavePoints[Math.min(waveIdx, wavePoints.length - 1)]?.y ?? curtainY;

      // Extension
      const extensionP = smoothStep(0, 0.6, dripP);
      const maxLen = 0.35 * drip.speed;
      const dripLen = extensionP * maxLen;
      if (dripLen < 0.002) continue;

      // Stretch
      const stretchP = smoothStep(0.4, 0.8, dripP);
      const neckW = baseW * (1 - stretchP * 0.65);
      const bulbW = baseW * (1 + stretchP * drip.bulge * 0.5);
      const stretchExtra = stretchP * maxLen * 0.4;
      const totalLen = dripLen + stretchExtra;
      const lean = drip.lean * baseW * stretchP;

      const dripTop = waveY;
      const dripBot = dripTop + totalLen;

      // Draw asymmetric drip with bezier curves
      const ctrlY1 = dripTop + totalLen * 0.4;
      const ctrlY2 = dripTop + totalLen * 0.7;

      path += ` M ${f(cx - neckW * 0.5 + lean * 0.3)},${f(dripTop)}`;
      // Left side down to tip
      path += ` C ${f(cx - neckW * 0.6 + lean * 0.5)},${f(ctrlY1)} ${f(cx - bulbW * 0.7 + lean)},${f(ctrlY2)} ${f(cx + lean)},${f(dripBot)}`;
      // Right side back up
      path += ` C ${f(cx + bulbW * 0.7 + lean)},${f(ctrlY2)} ${f(cx + neckW * 0.6 + lean * 0.5)},${f(ctrlY1)} ${f(cx + neckW * 0.5 + lean * 0.3)},${f(dripTop)}`;
      path += ` Z`;

      // Detached droplets
      if (drip.hasDrop && dripP > drip.dropDelay) {
        const dropP = smoothStep(drip.dropDelay, drip.dropDelay + 0.25, dripP);
        if (dropP > 0) {
          const gravity = dropP * dropP;
          const dropOffset = gravity * 0.2 * (drip.dropSpeed / 2);
          const dropY = dripBot + 0.01 + dropOffset;
          const dropR = bulbW * 0.4 * (1 - dropP * 0.3);

          if (dropR > 0.002 && dropY < 1.05) {
            // Teardrop
            path += ` M ${f(cx + lean)},${f(dropY - dropR * 1.8)}`;
            path += ` C ${f(cx + lean - dropR * 0.3)},${f(dropY - dropR)} ${f(cx + lean - dropR * 1.1)},${f(dropY - dropR * 0.2)} ${f(cx + lean - dropR * 0.9)},${f(dropY + dropR * 0.3)}`;
            path += ` C ${f(cx + lean - dropR * 0.5)},${f(dropY + dropR)} ${f(cx + lean + dropR * 0.5)},${f(dropY + dropR)} ${f(cx + lean + dropR * 0.9)},${f(dropY + dropR * 0.3)}`;
            path += ` C ${f(cx + lean + dropR * 1.1)},${f(dropY - dropR * 0.2)} ${f(cx + lean + dropR * 0.3)},${f(dropY - dropR)} ${f(cx + lean)},${f(dropY - dropR * 1.8)}`;
            path += ` Z`;
          }
        }
      }
    }
  }

  // ═══════════════════════════════════
  // PHASE 4 — FLOOD FILL
  // ═══════════════════════════════════
  if (phase4 > 0) {
    const floodY = curtainY + (1.05 - curtainY) * phase4;
    
    path += ` M 0,${f(curtainY)}`;
    path += ` L 1,${f(curtainY)}`;
    path += ` L 1,${f(floodY)}`;
    
    // Slight wave on flood front
    const floodWaveAmp = 0.008 * (1 - phase4);
    const floodSegs = 20;
    for (let s = floodSegs; s >= 0; s--) {
      const ratio = s / floodSegs;
      const wave = Math.sin(ratio * Math.PI * 5 + p * 3) * floodWaveAmp;
      path += ` L ${f(ratio)},${f(floodY + wave)}`;
    }
    
    path += ` Z`;
  }

  return path;
}
