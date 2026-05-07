"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * 7 fixed shards – polygon coords defined as [x%, y%] pairs.
 * They tile the viewport perfectly without any gaps.
 */

type Vec2 = [number, number];

interface ShardDef {
  points: string;      // SVG clipPath polygon
  ejectX: number;      // multiplier for translateX (vw)
  ejectY: number;      // multiplier for translateY (vh)
  rotation: number;    // final rotation in degrees
  delay: number;       // crack delay ms
  ejectDelay: number;  // eject delay ms
}

const SHARDS: ShardDef[] = [
  // 0 – Top Left (NW)
  {
    points: "0% 0%, 50% 0%, 45% 30%, 0% 40%",
    ejectX: -120,
    ejectY: -130,
    rotation: -45,
    delay: 0,
    ejectDelay: 0,
  },
  // 1 – Top Right (NE)
  {
    points: "50% 0%, 100% 0%, 100% 35%, 60% 40%, 45% 30%",
    ejectX: 140,
    ejectY: -110,
    rotation: 35,
    delay: 60,
    ejectDelay: 40,
  },
  // 2 – Middle Left (W)
  {
    points: "0% 40%, 45% 30%, 35% 65%, 0% 75%",
    ejectX: -150,
    ejectY: -20,
    rotation: -30,
    delay: 120,
    ejectDelay: 80,
  },
  // 3 – Center Shard
  {
    points: "45% 30%, 60% 40%, 75% 60%, 40% 70%, 35% 65%",
    ejectX: 20,
    ejectY: 160,
    rotation: 15,
    delay: 280,
    ejectDelay: 150,
  },
  // 4 – Middle Right (E)
  {
    points: "100% 35%, 100% 100%, 75% 60%, 60% 40%",
    ejectX: 160,
    ejectY: 40,
    rotation: 45,
    delay: 180,
    ejectDelay: 100,
  },
  // 5 – Bottom Left (SW)
  {
    points: "0% 75%, 35% 65%, 40% 70%, 50% 100%, 0% 100%",
    ejectX: -130,
    ejectY: 140,
    rotation: -60,
    delay: 240,
    ejectDelay: 120,
  },
  // 6 – Bottom Right (SE)
  {
    points: "40% 70%, 75% 60%, 100% 100%, 50% 100%",
    ejectX: 80,
    ejectY: 150,
    rotation: 25,
    delay: 320,
    ejectDelay: 180,
  },
];

const CRACK_DURATION = 150;
const HOLD_MS = 100;
const EJECT_DURATION = 850;
const REVEAL_DELAY = 350;
const TOTAL_TRANSITION = 1600;

export type Direction = "next" | "prev";

interface Props {
  isActive: boolean;
  direction: Direction;
  imageUrl?: string;
  children?: React.ReactNode;
  onReveal: () => void;
  onComplete: () => void;
}

interface ShardState {
  phase: "hidden" | "crack" | "eject" | "gone";
}

export default function GlassShatterTransition({
  isActive,
  direction,
  imageUrl,
  children,
  onReveal,
  onComplete,
}: Props) {
  const [shardStates, setShardStates] = useState<ShardState[]>(
    SHARDS.map(() => ({ phase: "hidden" }))
  );
  const [overlayVisible, setOverlayVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<{ crack: HTMLAudioElement | null; shatter: HTMLAudioElement | null }>({
    crack: null,
    shatter: null
  });

  const initAudio = useCallback(() => {
    if (audioRef.current.crack) return;

    const crack = new Audio("https://www.soundjay.com/buttons/sounds/button-20.mp3");
    const shatter = new Audio("https://www.soundjay.com/misc/sounds/glass-shatter-1.mp3");
    
    crack.volume = 0.3;
    shatter.volume = 0.5;
    
    crack.load();
    shatter.load();
    
    audioRef.current = { crack, shatter };
  }, []);

  const playSound = (type: "crack" | "shatter") => {
    const sound = audioRef.current[type];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
      });
    }
  };

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setShardStates(SHARDS.map(() => ({ phase: "hidden" })));
      setOverlayVisible(false);
      return;
    }

    initAudio();

    setOverlayVisible(true);

    // Phase 1: crack each shard sequentially
    SHARDS.forEach((shard, i) => {
      addTimer(() => {
        setShardStates((prev) => {
          const next = [...prev];
          next[i] = { phase: "crack" };
          return next;
        });
        playSound("crack");
      }, shard.delay);
    });

    // Phase 2: after all cracks → eject
    const lastCrack = SHARDS[SHARDS.length - 1].delay + CRACK_DURATION + HOLD_MS;
    
    // Play shatter sound once at the start of eject
    addTimer(() => {
      playSound("shatter");
    }, lastCrack);

    SHARDS.forEach((shard, i) => {
      addTimer(() => {
        setShardStates((prev) => {
          const next = [...prev];
          next[i] = { phase: "eject" };
          return next;
        });
      }, lastCrack + shard.ejectDelay);
    });

    // Phase 3: reveal new content mid-eject
    addTimer(() => {
      onReveal();
    }, lastCrack + REVEAL_DELAY);

    // Phase 4: mark shards gone + complete
    const lastEject =
      lastCrack +
      SHARDS[SHARDS.length - 1].ejectDelay +
      EJECT_DURATION;
    SHARDS.forEach((_, i) => {
      addTimer(() => {
        setShardStates((prev) => {
          const next = [...prev];
          next[i] = { phase: "gone" };
          return next;
        });
      }, lastEject);
    });

    addTimer(() => {
      setOverlayVisible(false);
      onComplete();
    }, lastEject + 100);

    return clearTimers;
  }, [isActive, direction, onReveal, onComplete, clearTimers, addTimer]);

  if (!overlayVisible) return null;

  // Mirror ejectX for "prev" navigation
  const dirMult = direction === "next" ? 1 : -1;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] overflow-hidden pointer-events-none"
    >
      <svg
        className="absolute inset-0 w-0 h-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
            {SHARDS.map((shard, i) => (
            <clipPath key={i} id={`shard-clip-${i}`} clipPathUnits="objectBoundingBox">
              <polygon
                points={shard.points
                  .split(",")
                  .map((pt) =>
                    pt
                      .trim()
                      .split(" ")
                      .map((v) => (parseFloat(v) / 100).toFixed(4))
                      .join(" ")
                  )
                  .join(", ")}
              />
            </clipPath>
          ))}
          <radialGradient id="impactGlow">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {SHARDS.map((shard, i) => {
        const { phase } = shardStates[i];
        if (phase === "hidden" || phase === "gone") return null;

        const isEjecting = phase === "eject";

        const tx = isEjecting ? shard.ejectX * dirMult : 0;
        const ty = isEjecting ? shard.ejectY : 0;
        const rot = isEjecting ? shard.rotation * dirMult : 0;
        const sc = isEjecting ? 0.6 : 1;
        const op = isEjecting ? 0 : 1;

        const ejectStyle: React.CSSProperties = isEjecting
          ? {
              transform: `translate(${tx}vw, ${ty}vh) rotate(${rot}deg) scale(${sc})`,
              opacity: op,
              transition: `transform ${EJECT_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${EJECT_DURATION * 0.8}ms ease-out`,
            }
          : {
              transform: "translate(0, 0) rotate(0deg) scale(1)",
              opacity: 1,
              transition: `opacity ${CRACK_DURATION}ms ease-in`,
            };

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              clipPath: `polygon(${shard.points})`,
              ...ejectStyle,
            }}
          >
            {/* Shard Background - either Children (Full UI) or Image */}
            <div className="absolute inset-0">
              {children ? (
                <div className="absolute inset-0 scale-[1.005]">
                  {children}
                </div>
              ) : imageUrl ? (
                <div 
                  className="absolute inset-0" 
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-black/70" />
              )}
            </div>

            {/* Slight dimming to make crack highlights more visible */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Glass surface overlay with shimmer */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(180,220,255,0.05) 100%)",
              }}
            >
              <div 
                className="absolute inset-0 w-[200%] h-full opacity-30 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  transform: "skewX(-20deg)",
                  animation: isActive ? "shimmer 2s infinite linear" : "none",
                }}
              />
            </div>

            {/* Crack highlight lines on edges */}
            <div
              className="absolute inset-0"
              style={{
                background: "transparent",
                boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.5)",
                filter: "drop-shadow(0 0 2px rgba(255,255,255,0.3))",
              }}
            />

            {/* Edge glow for shard separation */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 70%, rgba(255,255,255,0.12) 100%)",
              }}
            />
          </div>
        );
      })}

      {/* Crack lines overlay – updated for 7-shard system */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity:
            shardStates.some((s) => s.phase === "crack") &&
            !shardStates.some((s) => s.phase === "eject")
              ? 1
              : 0,
          transition: "opacity 100ms ease",
        }}
      >
        <style>
          {`
            @keyframes shimmer {
              0% { transform: translateX(-100%) skewX(-20deg); }
              100% { transform: translateX(100%) skewX(-20deg); }
            }
          `}
        </style>
        
        {/* Shard Boundaries as Crack Lines */}
        <line x1="50%" y1="0" x2="45%" y2="30%" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
        <line x1="0" y1="40%" x2="45%" y2="30%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <line x1="100%" y1="35%" x2="60%" y2="40%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <line x1="60%" y1="40%" x2="45%" y2="30%" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <line x1="45%" y1="30%" x2="35%" y2="65%" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
        <line x1="0" y1="75%" x2="35%" y2="65%" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        <line x1="60%" y1="40%" x2="75%" y2="60%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <line x1="75%" y1="60%" x2="40%" y2="70%" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <line x1="40%" y1="70%" x2="35%" y2="65%" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <line x1="75%" y1="60%" x2="100%" y2="100%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1="40%" y1="70%" x2="50%" y2="100%" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />

        {/* Impact point – main crack source, responsive percentage based */}
        <g filter="blur(0.5px)">
          <circle cx="45%" cy="30%" r="4" fill="white" />
          <circle cx="45%" cy="30%" r="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <circle cx="45%" cy="30%" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Subtle radial glow at impact */}
          <ellipse cx="45%" cy="30%" rx="60" ry="40" fill="url(#impactGlow)" />
        </g>
      </svg>
    </div>
  );
}
