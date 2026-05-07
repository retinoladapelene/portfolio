"use client";

import { useRef, useEffect, useCallback } from "react";

interface InkDripMaskProps {
  progress: number; // 0 → 1
}

// ──────────────────────────────────────────────────────────────────────────────
// PHASE-BASED INK DRIP ENGINE
// Phase 1 (0.00–0.15): Edge Formation — flat line → wavy bumps appear
// Phase 2 (0.15–0.45): Drip Extension — bumps stretch downward asymmetrically
// Phase 3 (0.45–0.70): Stretch & Break — drips elongate, thin necks, detached drops
// Phase 4 (0.70–1.00): Full Cover — liquid floods and covers the entire screen
// ──────────────────────────────────────────────────────────────────────────────

// Seeded pseudo-random for deterministic drip placement
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);

// Each drip has unique characteristics — asymmetry is key to realism
interface DripConfig {
  cx: number;        // X position (0–1 normalized)
  speed: number;     // Individual fall speed multiplier
  width: number;     // Base width (px at 1920w)
  delay: number;     // When this drip starts forming (0–1)
  bulge: number;     // How much the tip bulges (gravity effect)
  lean: number;      // Asymmetry lean (-1 to 1)
  hasDrop: boolean;  // Whether a detached droplet breaks off
  dropDelay: number; // When the drop detaches
  dropSpeed: number; // Detached drop fall acceleration
}

const DRIP_COUNT = 18;
const DRIPS: DripConfig[] = Array.from({ length: DRIP_COUNT }, (_, i) => {
  const cx = (i + 0.3 + rng() * 0.4) / DRIP_COUNT;
  return {
    cx: Math.min(0.97, Math.max(0.03, cx)),
    speed: 0.6 + rng() * 1.4,
    width: 8 + rng() * 28,
    delay: rng() * 0.12,
    bulge: 0.5 + rng() * 1.2,
    lean: (rng() - 0.5) * 0.6,
    hasDrop: rng() > 0.55,
    dropDelay: 0.55 + rng() * 0.15,
    dropSpeed: 1.5 + rng() * 2.0,
  };
});

// Smooth step for organic transitions
function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Heavy ink easing — slow start, thick movement
function inkEase(t: number): number {
  if (t < 0.3) return 2.5 * t * t;
  if (t < 0.7) return 0.225 + (t - 0.3) * 1.4375;
  return 1 - 1.5 * (1 - t) * (1 - t);
}

// INK TINT COLOR — subtle indigo for the edge glow
const INK_EDGE_COLOR = "rgba(60, 30, 90, 0.95)";
const INK_BODY_COLOR = "#0B0F1A";

export default function InkDripMask({ progress }: InkDripMaskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.clearRect(0, 0, W, H);
    if (progress <= 0) return;

    const p = Math.min(1, Math.max(0, progress));

    // ════════════════════════════════════════════════
    // PHASE CALCULATIONS
    // ════════════════════════════════════════════════
    const phase1 = smoothStep(0, 0.15, p);       // Edge formation
    const phase2 = smoothStep(0.12, 0.45, p);     // Drip extension
    const phase3 = smoothStep(0.40, 0.70, p);     // Stretch & break
    const phase4 = smoothStep(0.65, 1.0, p);      // Full cover

    // ════════════════════════════════════════════════
    // MAIN CURTAIN — descends with ink easing
    // ════════════════════════════════════════════════
    const curtainTarget = H * 1.15;
    const curtainY = inkEase(p) * curtainTarget;

    // ════════════════════════════════════════════════
    // PHASE 1 — EDGE FORMATION (wavy bumps appear)
    // ════════════════════════════════════════════════
    
    // Wave complexity increases with phase1
    const waveSegments = 200;
    const wavePoints: { x: number; y: number }[] = [];
    
    for (let s = 0; s <= waveSegments; s++) {
      const ratio = s / waveSegments;
      const x = ratio * W;
      
      // Multi-frequency waves — more complex = more realistic
      const freq1 = Math.sin(ratio * Math.PI * 3.7 + p * 2.1);
      const freq2 = Math.sin(ratio * Math.PI * 7.3 + p * 3.8) * 0.5;
      const freq3 = Math.sin(ratio * Math.PI * 13.1 + p * 5.2) * 0.25;
      const freq4 = Math.sin(ratio * Math.PI * 19.7 + p * 1.3) * 0.12;
      
      // Phase 1: bumps grow from flat
      const bumpAmplitude = phase1 * 12 * (1 - phase4 * 0.8);
      const bump = (freq1 + freq2 + freq3 + freq4) * bumpAmplitude;
      
      // Phase 4: waves flatten as curtain covers everything
      const y = curtainY + bump;
      
      wavePoints.push({ x, y });
    }

    // ════════════════════════════════════════════════
    // DRAW MAIN CURTAIN BODY
    // ════════════════════════════════════════════════
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, curtainY);

    // Smooth curve through wave points (right to left)
    for (let i = wavePoints.length - 1; i >= 0; i--) {
      if (i === wavePoints.length - 1) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
      } else {
        // Use quadratic curves for smooth connection
        const curr = wavePoints[i];
        const next = wavePoints[i + 1];
        const cpX = (curr.x + next.x) / 2;
        const cpY = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(next.x, next.y, cpX, cpY);
      }
    }
    ctx.lineTo(0, curtainY);
    ctx.closePath();
    ctx.fillStyle = INK_BODY_COLOR;
    ctx.fill();

    // ════════════════════════════════════════════════
    // EDGE GLOW — subtle ink tint along the dripping edge
    // ════════════════════════════════════════════════
    if (phase1 > 0 && phase4 < 0.95) {
      const edgeGradient = ctx.createLinearGradient(0, curtainY - 25, 0, curtainY + 15);
      edgeGradient.addColorStop(0, "transparent");
      edgeGradient.addColorStop(0.4, INK_EDGE_COLOR);
      edgeGradient.addColorStop(1, "transparent");
      
      ctx.beginPath();
      ctx.moveTo(0, curtainY - 25);
      ctx.lineTo(W, curtainY - 25);
      // Follow the wave edge
      for (let i = wavePoints.length - 1; i >= 0; i--) {
        const pt = wavePoints[i];
        ctx.lineTo(pt.x, pt.y + 8);
      }
      ctx.closePath();
      ctx.fillStyle = edgeGradient;
      ctx.fill();
    }

    // ════════════════════════════════════════════════
    // PHASE 2 & 3 — DRIP EXTENSION & STRETCH
    // ════════════════════════════════════════════════
    if (phase2 > 0 && phase4 < 0.98) {
      for (const drip of DRIPS) {
        // Per-drip progress with individual delay
        const dripP = Math.max(0, Math.min(1, (p - drip.delay) * drip.speed));
        if (dripP <= 0.01) continue;

        const cx = drip.cx * W;
        const baseWidth = drip.width * (W / 1920); // Scale to viewport

        // Find the wave Y at this drip's X position
        const waveIdx = Math.round(drip.cx * waveSegments);
        const waveY = wavePoints[Math.min(waveIdx, wavePoints.length - 1)]?.y ?? curtainY;

        // ── PHASE 2: Extension ──
        const extensionP = smoothStep(0, 0.6, dripP);
        const maxDripLength = H * 0.35 * drip.speed;
        const dripLength = extensionP * maxDripLength;

        if (dripLength < 2) continue;

        // ── PHASE 3: Stretch effect ──
        const stretchP = smoothStep(0.4, 0.8, dripP);
        
        // Neck gets THINNER as it stretches (surface tension)
        const neckWidth = baseWidth * (1 - stretchP * 0.65);
        // Bulb gets WIDER at the bottom (gravity effect)
        const bulbWidth = baseWidth * (1 + stretchP * drip.bulge * 0.5);
        // Extra stretch length in phase 3
        const stretchExtra = stretchP * maxDripLength * 0.4;
        const totalLength = dripLength + stretchExtra;

        // Asymmetry — lean to one side
        const leanOffset = drip.lean * baseWidth * stretchP;

        // ── DRAW THE DRIP ──
        const dripTop = waveY;
        const dripBottom = dripTop + totalLength;

        ctx.beginPath();

        // Start at the neck (top of drip, connected to curtain)
        // Left side of neck
        ctx.moveTo(cx - neckWidth * 0.5 + leanOffset * 0.3, dripTop);

        // Left side going down — curves outward for the bulb
        const controlY1 = dripTop + totalLength * 0.4;
        const controlY2 = dripTop + totalLength * 0.7;
        
        ctx.bezierCurveTo(
          cx - neckWidth * 0.6 + leanOffset * 0.5, controlY1,      // Narrow neck
          cx - bulbWidth * 0.7 + leanOffset, controlY2,             // Bulge out
          cx + leanOffset, dripBottom                                // Tip
        );

        // Right side coming back up
        ctx.bezierCurveTo(
          cx + bulbWidth * 0.7 + leanOffset, controlY2,
          cx + neckWidth * 0.6 + leanOffset * 0.5, controlY1,
          cx + neckWidth * 0.5 + leanOffset * 0.3, dripTop
        );

        ctx.closePath();
        ctx.fillStyle = INK_BODY_COLOR;
        ctx.fill();

        // ── EDGE TINT on drip ──
        if (stretchP > 0.1) {
          const dripEdgeGrad = ctx.createRadialGradient(
            cx + leanOffset, dripBottom - bulbWidth, bulbWidth * 0.2,
            cx + leanOffset, dripBottom - bulbWidth, bulbWidth * 1.2
          );
          dripEdgeGrad.addColorStop(0, "rgba(80, 40, 120, 0.3)");
          dripEdgeGrad.addColorStop(1, "transparent");
          ctx.fillStyle = dripEdgeGrad;
          ctx.fill();
        }

        // ── PHASE 3: Detached droplets ──
        if (drip.hasDrop && dripP > drip.dropDelay) {
          const dropP = smoothStep(drip.dropDelay, drip.dropDelay + 0.25, dripP);
          if (dropP > 0) {
            // Droplet accelerates as it falls (gravity)
            const gravity = dropP * dropP; // Quadratic acceleration
            const dropOffset = gravity * H * 0.25 * (drip.dropSpeed / 2);
            const dropY = dripBottom + 8 + dropOffset;
            const dropRadius = bulbWidth * 0.35 * (1 - dropP * 0.3);

            if (dropRadius > 1 && dropY < H + 20) {
              // Teardrop shape for the detached drop
              ctx.beginPath();
              
              // Pointed top
              ctx.moveTo(cx + leanOffset, dropY - dropRadius * 1.8);
              
              // Left curve
              ctx.bezierCurveTo(
                cx + leanOffset - dropRadius * 0.3, dropY - dropRadius * 1.0,
                cx + leanOffset - dropRadius * 1.1, dropY - dropRadius * 0.2,
                cx + leanOffset - dropRadius * 0.9, dropY + dropRadius * 0.3
              );
              
              // Bottom curve
              ctx.bezierCurveTo(
                cx + leanOffset - dropRadius * 0.5, dropY + dropRadius * 1.0,
                cx + leanOffset + dropRadius * 0.5, dropY + dropRadius * 1.0,
                cx + leanOffset + dropRadius * 0.9, dropY + dropRadius * 0.3
              );
              
              // Right curve back to top
              ctx.bezierCurveTo(
                cx + leanOffset + dropRadius * 1.1, dropY - dropRadius * 0.2,
                cx + leanOffset + dropRadius * 0.3, dropY - dropRadius * 1.0,
                cx + leanOffset, dropY - dropRadius * 1.8
              );
              
              ctx.closePath();
              ctx.fillStyle = INK_BODY_COLOR;
              ctx.fill();

              // Tiny satellite drops (splash effect)
              if (dropP > 0.3 && dropRadius > 3) {
                const satCount = Math.floor(rng() * 3) + 1;
                for (let s = 0; s < satCount; s++) {
                  const satAngle = (s / satCount) * Math.PI + rng() * 0.5;
                  const satDist = dropRadius * (1.8 + rng() * 1.2);
                  const satX = cx + leanOffset + Math.cos(satAngle) * satDist;
                  const satY = dropY + dropRadius * 0.5 + Math.sin(satAngle) * satDist * 0.5;
                  const satR = 1 + rng() * 2.5;
                  
                  ctx.beginPath();
                  ctx.arc(satX, satY, satR * (1 - dropP * 0.4), 0, Math.PI * 2);
                  ctx.fillStyle = INK_BODY_COLOR;
                  ctx.fill();
                }
              }
            }
          }

          // ── Thin thread connecting drip to drop ──
          if (dropP > 0 && dropP < 0.7) {
            const threadAlpha = 1 - dropP / 0.7;
            const threadWidth = Math.max(0.5, neckWidth * 0.1 * threadAlpha);
            const dropFallY = dripBottom + 8 + (dropP * dropP) * H * 0.25 * (drip.dropSpeed / 2);
            
            ctx.beginPath();
            ctx.moveTo(cx + leanOffset, dripBottom);
            ctx.bezierCurveTo(
              cx + leanOffset + drip.lean * 3, dripBottom + (dropFallY - dripBottom) * 0.3,
              cx + leanOffset - drip.lean * 2, dripBottom + (dropFallY - dripBottom) * 0.6,
              cx + leanOffset, Math.min(dropFallY, dropFallY - 5)
            );
            ctx.strokeStyle = INK_BODY_COLOR;
            ctx.lineWidth = threadWidth;
            ctx.stroke();
          }
        }
      }
    }

    // ════════════════════════════════════════════════
    // PHASE 4 — FULL COVER (flood fill)
    // ════════════════════════════════════════════════
    if (phase4 > 0) {
      // The flood rises from the drips' tips upward
      const floodY = curtainY + (H - curtainY) * phase4;
      
      ctx.beginPath();
      ctx.moveTo(0, curtainY);
      ctx.lineTo(W, curtainY);
      ctx.lineTo(W, floodY);
      
      // Slight wave on the flood front (dissipating)
      const floodWaveAmp = 6 * (1 - phase4);
      for (let s = waveSegments; s >= 0; s--) {
        const ratio = s / waveSegments;
        const x = ratio * W;
        const wave = Math.sin(ratio * Math.PI * 5 + p * 3) * floodWaveAmp;
        ctx.lineTo(x, floodY + wave);
      }
      
      ctx.lineTo(0, curtainY);
      ctx.closePath();
      ctx.fillStyle = INK_BODY_COLOR;
      ctx.fill();
    }

  }, [progress]);

  // Resize canvas to match element dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      draw();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  // Redraw on progress change
  useEffect(() => {
    draw();
  }, [progress, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 20 }}
    />
  );
}
