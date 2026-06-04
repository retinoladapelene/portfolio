"use client";

import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
    Environment,
    Loader,
    KeyboardControls,
    useKeyboardControls,
    PointerLockControls,
    Html,
    AdaptiveDpr,
    AdaptiveEvents,
    Bvh
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Maximize, Minimize, Eye, EyeOff, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";


// Refactored Components
import { GalleryScene } from "./components/GalleryScene";
import { Player, VirtualJoystick } from "./components/Controls";

// --- Configuration ---
const ROOM_RADIUS = 12;
const ART_Y = 4.5;


// ... Main Page ...
// Update the Canvas section to be more interactive

// --- Main Page ---
export default function GalleryPage() {
    const [selectedArt, setSelectedArt] = useState<any>(null);
    const [showIntro, setShowIntro] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
    const [joystickData, setJoystickData] = useState<{ x: number; y: number } | null>(null);
    const [isPortrait, setIsPortrait] = useState(false);
    const [isPointerLocked, setIsPointerLocked] = useState(false);
    const [isImmersionMode, setIsImmersionMode] = useState(false);
    const [isSurpriseActive, setIsSurpriseActive] = useState(false);
    const [showLetter, setShowLetter] = useState(false);
    const [showBook, setShowBook] = useState(false);
    const [bookSolved, setBookSolved] = useState(false);
    const [bookInput, setBookInput] = useState("");
    const [isBookIncorrect, setIsBookIncorrect] = useState(false);
    const [isBookNearMiss, setIsBookNearMiss] = useState(false);
    const [compatibility, setCompatibility] = useState<{
        isCompatible: boolean;
        reason: string | null;
        checked: boolean;
    }>({ isCompatible: true, reason: null, checked: false });

    // Device Compatibility Check
    useEffect(() => {
        const checkCompatibility = () => {
            const reasons: string[] = [];

            // 1. Check for WebGL 2 support
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            if (!gl) {
                reasons.push("WebGL 2.0 is not supported by your browser/device.");
            }

            // 2. Heuristic check for low-end hardware
            // Note: deviceMemory is not supported in all browsers (e.g. Firefox/Safari)
            const memory = (navigator as any).deviceMemory;
            const cores = navigator.hardwareConcurrency;

            // If we have access to these, check them
            if (memory !== undefined && memory < 4) {
                reasons.push(`Low System Memory (${memory}GB RAM).`);
            }
            if (cores !== undefined && cores < 4) {
                reasons.push(`Low Processing Power (${cores} cores).`);
            }

            // 3. Detect extremely old mobile via user agent if needed (optional)
            const isVeryOldMobile = /Android [1-7]/i.test(navigator.userAgent) || /iPhone OS [1-9]_/i.test(navigator.userAgent);
            if (isVeryOldMobile) {
                reasons.push("Older mobile operating system detected.");
            }

            if (reasons.length > 0) {
                // If there are issues, set incompatible
                // But only if WebGL is missing OR multiple low-end factors exist
                const criticalFailure = !gl || reasons.length >= 2;
                setCompatibility({
                    isCompatible: !criticalFailure,
                    reason: reasons.join(" "),
                    checked: true
                });

                // Auto-set quality to low if it's borderline
                if (!criticalFailure) {
                    setQuality('low');
                }
            } else {
                setCompatibility({ isCompatible: true, reason: null, checked: true });
            }
        };

        checkCompatibility();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'f') {
                setIsImmersionMode(prev => !prev);
            }
        };
        const handleToggle = () => setIsImmersionMode(prev => !prev);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('toggle-immersion', handleToggle);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('toggle-immersion', handleToggle);
        };
    }, []);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    useEffect(() => {
        const fetchArt = async () => {
            try {
                const res = await fetch('/api/gallery');
                const result = await res.json();
                if (result.success) {
                    setArtworks(result.data);
                }
            } catch (err) {
                console.error("Failed to fetch gallery:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArt();
    }, []);

    const keyboardMap = useMemo(() => [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
    ], []);

    useEffect(() => {
        // We no longer auto-hide intro, wait for user click
    }, []);

    const handleStart = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setShowIntro(false);
        setIsStarted(true);
    };

    const handleBookSubmit = () => {
        const val = bookInput.toLowerCase().trim();
        const correctAnswers = ['miss honey', 'ms honey'];
        const nearMisses = ['honey', 'hani', 'miss hani', 'ms hani', 'miss honi', 'ms honi', 'honi', 'mrs honey', 'mrs hani'];

        if (correctAnswers.includes(val)) {
            setBookSolved(true);
            setIsBookIncorrect(false);
            setIsBookNearMiss(false);
        } else if (nearMisses.includes(val)) {
            setIsBookNearMiss(true);
            setIsBookIncorrect(false);
        } else {
            setIsBookIncorrect(true);
            setIsBookNearMiss(false);
        }
    };

    return (
        <KeyboardControls map={keyboardMap}>

            <main
                className="relative h-screen w-full bg-[#050505] overflow-hidden cursor-crosshair"
                onClick={() => { }}
            >
                {/* UI Overlay */}
                <AnimatePresence>
                    {!isImmersionMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-8 left-8 z-50 flex items-center gap-6"
                        >
                            <Link href="/" className="group flex items-center gap-4 text-white/50 hover:text-white transition-all">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all">
                                    <ArrowLeft size={18} />
                                </div>
                                <span className="font-outfit text-[10px] font-black uppercase tracking-[0.4em]">Exit Gallery</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!isImmersionMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-8 right-8 z-50 text-right hidden md:block"
                        >
                            <h1 className="font-syne text-xl font-bold text-white tracking-tighter italic">Moonchaery 3D Gallery</h1>
                            <p className="font-outfit text-[8px] text-white/30 uppercase tracking-[0.5em] mt-1 italic">
                                Explore the Circular Gallery • <span className="hidden lg:inline">WASD to Walk</span><span className="lg:hidden">Joystick to Walk</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Immersion Mode Toggle Button - Always Visible but Discreet */}
                <AnimatePresence>
                    {!isImmersionMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-8 left-1/2 -translate-x-1/2 z-[100]"
                        >
                            <button
                                onClick={() => setIsImmersionMode(!isImmersionMode)}
                                className={cn(
                                    "group flex items-center gap-3 px-6 py-2.5 rounded-full backdrop-blur-md border transition-all duration-500 bg-black/40 border-white/10 text-white/50 hover:text-white hover:border-purple-500/30"
                                )}
                                title="Toggle Immersion Mode (F)"
                            >
                                <EyeOff size={16} />
                                <span className="font-outfit text-[9px] font-black uppercase tracking-[0.3em]">
                                    Immersion Mode
                                </span>
                                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-mono border border-white/10 ml-1">F</kbd>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3D Canvas */}
                {/* Central POV Pointer (Crosshair) */}
                {isStarted && !selectedArt && (
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[60]">
                        {/* Core Dot */}
                        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        {/* Outer Ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/20 rounded-full animate-pulse" />
                        {/* Horizontal Cross */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-px bg-white/40" />
                        {/* Vertical Cross */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-4 bg-white/40" />
                    </div>
                )}

                <div id="gallery-container" className="h-full w-full">
                    <Canvas
                        shadows={quality === 'high'}
                        dpr={quality === 'high' ? [1, 2] : (quality === 'medium' ? [1, 1.5] : 1)}
                        camera={{ position: [0, 1.6, 5], fov: 65 }}
                        gl={{
                            antialias: quality === 'high',
                            powerPreference: "high-performance",
                            stencil: false,
                            depth: true,
                            alpha: false
                        }}
                        onCreated={({ gl }) => {
                            gl.setClearColor('#050505');
                        }}
                    >
                        <Suspense fallback={
                            <Html center>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "100%" }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            className="h-full w-full bg-[#D4AF37]"
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">Loading Moonchaery Gallery</span>
                                </div>
                            </Html>
                        }>
                            <Bvh firstHitOnly>
                                <GalleryScene
                                    onSelectArt={setSelectedArt}
                                    artworks={artworks}
                                    quality={quality}
                                    isSurpriseActive={isSurpriseActive}
                                    setIsSurpriseActive={setIsSurpriseActive}
                                    setShowLetter={setShowLetter}
                                    setShowBook={setShowBook}
                                    isLetterOpen={showLetter}
                                    isBookOpen={showBook}
                                />
                            </Bvh>
                            <Player joystickData={joystickData} />

                            {/* Performance Boosters */}
                            <AdaptiveDpr pixelated />
                            <AdaptiveEvents />
                        </Suspense>

                        {/* Only instantiate PointerLock on Desktop and when no modals are open */}
                        {isStarted && !selectedArt && !showLetter && !showBook && typeof window !== 'undefined' && window.innerWidth >= 768 && (
                            <PointerLockControls
                                selector="#gallery-container"
                                makeDefault
                                onLock={() => setIsPointerLocked(true)}
                                onUnlock={() => setIsPointerLocked(false)}
                            />
                        )}

                        <Suspense fallback={null}>
                            {quality !== 'low' && !isSurpriseActive && <Environment preset="city" />}
                        </Suspense>
                    </Canvas>
                    <Loader />
                </div>



                {/* Orientation Warning Overlay */}
                <AnimatePresence>
                    {isPortrait && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-12 text-center"
                        >
                            <motion.div
                                animate={{ rotate: 90 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-20 h-32 border-4 border-white/20 rounded-xl mb-8 flex items-center justify-center"
                            >
                                <div className="w-2 h-2 bg-white/20 rounded-full mt-auto mb-2" />
                            </motion.div>
                            <h2 className="font-syne text-2xl font-bold text-white mb-2">Rotate Your Device</h2>
                            <p className="font-outfit text-white/50 text-sm">Please use landscape mode for the best gallery experience.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Intro Overlay (Mandatory User Gesture) */}
                {showIntro && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                        <div className="text-center p-8 max-w-md border border-white/10 rounded-3xl bg-black/40 mx-4">
                            <h2 className="font-syne text-3xl font-bold text-white mb-4">Moonchaery Gallery</h2>
                            <p className="font-outfit text-white/60 mb-8 leading-relaxed">
                                Experience high-fidelity artworks in a circular 3D environment.
                                <span className="block mt-2 text-[#D4AF37] md:block hidden">WASD to Move • Mouse to Look</span>
                                <span className="block mt-2 text-[#D4AF37] md:hidden">Use Joystick to Walk • Drag to Look</span>
                            </p>
                            <button
                                onClick={(e) => handleStart(e)}
                                className="group relative px-10 py-4 bg-[#D4AF37] text-black rounded-full font-black uppercase tracking-[0.2em] hover:scale-105 transition-all overflow-hidden"
                            >
                                <span className="relative z-10">Start Exploration</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                            <p className="mt-6 text-[10px] text-white/20 uppercase tracking-[0.2em] md:block hidden">Click Start to Enter 3D View</p>
                        </div>
                    </div>
                )}

                {/* Re-lock Instruction (When user ESC but gallery is still active) */}
                {isStarted && !isPointerLocked && !selectedArt && !showLetter && !showBook && !isPortrait && typeof window !== 'undefined' && window.innerWidth >= 768 && (
                    <div className="absolute inset-0 z-[40] flex items-center justify-center bg-black/20 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                            <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black italic">Click to Resume Exploration</p>
                        </div>
                    </div>
                )}

                {/* Quality Settings UI */}
                <AnimatePresence>
                    {!isImmersionMode && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-2"
                        >

                            <span className="font-outfit text-[8px] text-white/30 uppercase tracking-[0.4em] mb-1">Graphics Quality</span>
                            <div className="flex gap-2">
                                {['low', 'medium', 'high'].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setQuality(q as any)}
                                        className={`px-4 py-2 rounded-full font-outfit text-[8px] uppercase tracking-[0.2em] transition-all border ${quality === q
                                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                            : 'bg-black/40 text-white/40 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Persistent ESC Hint */}
                {isStarted && !isPortrait && typeof window !== 'undefined' && window.innerWidth >= 768 && (
                    <div className="fixed bottom-10 left-10 z-[999] pointer-events-none">
                        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-2.5">
                                <kbd className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] text-white font-mono border border-white/20 shadow-inner leading-none">ESC</kbd>
                                <span className="text-white/20 h-3 w-[1px] bg-white/10" />
                                <div className="font-outfit text-[9px] text-white/60 font-black uppercase tracking-[0.3em] whitespace-nowrap italic flex items-center gap-2">
                                    <span>Exit Explore Mode</span>
                                    {(showLetter || showBook) && (
                                        <>
                                            <span className="text-white/30">|</span>
                                            <span className="text-[#D4AF37]">Show Cursor</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Hint */}
                <AnimatePresence>
                    {!isImmersionMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 hidden lg:flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/5"
                        >
                            <div className="flex gap-6 items-center">
                                <div className="flex gap-2">
                                    {['W', 'A', 'S', 'D'].map(key => (
                                        <kbd key={key} className="px-3 py-1.5 bg-white/10 rounded-md text-[11px] text-white font-mono border border-white/10 shadow-inner">{key}</kbd>
                                    ))}
                                </div>
                                <span className="text-white/20 h-4 w-[1px] bg-white/20" />
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                                    <p className="font-outfit text-[10px] text-white font-black uppercase tracking-[0.4em] whitespace-nowrap">
                                        Exploration Active
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Love Letter UI Overlay */}
                <AnimatePresence>
                    {showLetter && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="relative max-w-2xl w-full max-h-[90vh] bg-[#fdfaf1] shadow-2xl rounded-sm border-l-[12px] border-[#e8dfc7] flex flex-col overflow-hidden"
                                style={{
                                    backgroundImage: "radial-gradient(#d4c4a8 0.5px, transparent 0.5px)",
                                    backgroundSize: "20px 20px"
                                }}
                            >
                                <button
                                    onClick={() => setShowLetter(false)}
                                    className="absolute top-6 right-6 z-10 text-[#8b4513]/40 hover:text-[#8b4513] transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex-1 overflow-y-auto p-12 md:p-20 scrollbar-thin scrollbar-thumb-[#e8dfc7] scrollbar-track-transparent">
                                    <div className="space-y-8 font-serif text-[#4a3728] leading-relaxed">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-8 h-8" /> {/* Spacer */}
                                            <p className="font-outfit text-[10px] font-black uppercase tracking-[0.4em] text-[#8b4513]/40">09.08.2024</p>
                                        </div>
                                        <div className="flex justify-center mb-12">
                                            <Heart className="text-red-800 fill-red-800/10" size={32} />
                                        </div>

                                        <h2 className="text-3xl font-bold italic mb-8 border-b border-[#8b4513]/10 pb-4 tracking-tight">Happy Birthday, Ayaa 🤍</h2>

                                        <p className="text-lg md:text-xl italic">
                                            Semoga panjang umur, selalu sehat, dan semua mimpi yang kamu cita-citakan bisa tercapai satu per satu. Semoga hari-hari ke depan dipenuhi kebahagiaan, ketenangan, dan cinta dari orang-orang di sekitarmu.
                                        </p>

                                        <p className="text-lg md:text-xl italic">
                                            Honestly, you probably don't even realize how much potential you have. But since we’ve known each other, I’ve always seen you as one of the most talented people I’ve ever known—fr. Thank you for trusting me and for being so open about your life and the stories you shared with me, even the heavy ones.
                                        </p>

                                        <p className="text-lg md:text-xl italic">
                                            You told me you’ve been through a lot of tough times, from being a kid until now. It hasn't been easy, but you’ve made it this far. but kamu mampu melewati hal hal itu walaupun nangis dikit, "kamu yang bilang bgitu 😁". and that’s exactly why I admire you even more—because you’re literally so strong.
                                        </p>

                                        <p className="text-lg md:text-xl italic">
                                            I realize I’ve always struggled to express my feelings. I can’t easily put into words how much I care about you and love you. So maybe this gift can stand for all the things I could never say.
                                        </p>

                                        <p className="text-lg md:text-xl italic">
                                            One day, if we meet, it's going to be the happiest day of my life! I really hope I get to meet you one day. soon!!!!
                                        </p>

                                        <p className="text-lg md:text-xl italic font-bold">
                                            Pls open the book next to you.
                                        </p>

                                        <div className="pt-12 flex flex-col items-start">
                                            <div className="relative w-[200px] h-[100px] mb-12 -ml-8 opacity-90 mix-blend-multiply -rotate-90 origin-center scale-[1.5]">
                                                <img
                                                    src="/signature.webp"
                                                    alt="Signature"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="w-44 h-px bg-[#8b4513]/20 mb-2" />
                                            <p className="font-outfit text-[10px] font-black uppercase tracking-[0.5em] text-[#8b4513]/50">bintang (iyoo)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Paper texture effect */}
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-black/5" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Novel Book UI Overlay */}
                <AnimatePresence>
                    {showBook && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
                            onClick={() => {
                                setShowBook(false);
                                setBookSolved(false);
                                setBookInput("");
                                setIsBookIncorrect(false);
                                setIsBookNearMiss(false);
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative max-w-4xl w-full aspect-[3/4] md:aspect-video flex items-center justify-center"
                            >
                                <button
                                    onClick={() => {
                                        setShowBook(false);
                                        setBookSolved(false);
                                        setBookInput("");
                                        setIsBookIncorrect(false);
                                        setIsBookNearMiss(false);
                                    }}
                                    className="absolute -top-12 right-0 md:top-0 md:-right-12 z-10 text-white/50 hover:text-white transition-colors"
                                >
                                    <X size={32} />
                                </button>

                                <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row bg-[#0a0a0a]">
                                    {/* Page 1: Image */}
                                    <div className="flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/10 relative">
                                        <img
                                            src="/images/matilda.jpg"
                                            alt="Matilda"
                                            className="w-full h-full object-cover md:object-contain bg-black"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                            <p className="font-syne text-xs uppercase tracking-[0.3em] text-white/50">Page One</p>
                                        </div>
                                    </div>

                                    {/* Page 2: Riddle / Message */}
                                    <div className="flex-1 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center bg-[#0d0d0d] relative overflow-y-auto">
                                        <AnimatePresence mode="wait">
                                            {!bookSolved ? (
                                                <motion.div
                                                    key="riddle"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-2">
                                                        <h3 className="font-syne text-2xl font-black text-[#D4AF37] uppercase tracking-tighter italic">RIDDLE</h3>
                                                        <div className="h-px w-12 bg-[#D4AF37]/50" />
                                                    </div>

                                                    <p className="font-outfit text-white/80 text-lg leading-relaxed italic">
                                                        "I am a teacher with a gentle heart,<br />
                                                        Though my life was difficult from the very start.<br />
                                                        I love my students, especially the special one,<br />
                                                        Who am I in the story of Matilda?"
                                                    </p>

                                                    <div className="pt-2">
                                                        <p className="font-syne text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">
                                                            Clue: Read the novel "Matilda" by Roald Dahl to find the answer.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        <input
                                                            type="text"
                                                            value={bookInput}
                                                            onChange={(e) => {
                                                                setBookInput(e.target.value);
                                                                setIsBookIncorrect(false);
                                                                setIsBookNearMiss(false);
                                                            }}
                                                            placeholder="Your Answer..."
                                                            className={cn(
                                                                "w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-outfit focus:outline-none focus:border-[#D4AF37]/50 transition-all",
                                                                (isBookIncorrect || isBookNearMiss) && "border-red-500/50 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                                            )}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleBookSubmit();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={handleBookSubmit}
                                                            className="w-full py-4 bg-[#D4AF37] text-black font-syne font-black uppercase tracking-widest rounded-xl hover:bg-[#C5A028] transition-all"
                                                        >
                                                            CONFIRM
                                                        </button>
                                                        {isBookIncorrect && (
                                                            <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest text-center animate-bounce">
                                                                Incorrect Answer. Try Again.
                                                            </p>
                                                        )}
                                                        {isBookNearMiss && (
                                                            <p className="text-orange-400 text-[10px] uppercase font-bold tracking-widest text-center animate-pulse">
                                                                Almost correct! Just check your spelling.
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="message"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-2">
                                                        <h3 className="font-syne text-2xl font-bold text-[#D4AF37] italic">Have you read the novel yet?</h3>
                                                        <div className="h-px w-12 bg-[#D4AF37]/50" />
                                                    </div>
                                                    <div className="space-y-4 font-outfit text-white/90 text-sm md:text-base leading-relaxed italic border-l-2 border-[#D4AF37]/30 pl-6 py-2 overflow-y-auto max-h-[60vh]">
                                                        <p>‘kamu tau gak alasan aku buat semua ini???" kamu inget gak waktu kamu cerita dimana lukisan yang kamu buat susah payah dirobek?? I still remember that story of yours very clearly. maybe I’m the best listener but I’m the worst at responder. aku gatau harus berbuat apa saat denger cerita kamu yang itu. dan semua itu yang menjadi alasanku untuk ngebuat semua ini untuk kamu. I feel like we’re in the same position. And I totally understand how you felt back then—when we had passion and skill but not a single person believed in or supported us. And from back then until now, I feel like I’m still in that position. Maybe that’s still one of the reasons why I'm still not good express my feelings?? karena itu aku ngebuat ini semua sampe seniat ini bukan hanya sebagai hadiah(gift) tetapi sebagai bentuk moral support buat kamu yang hebat itu..</p>
                                                        
                                                        <p>kamu pasti bertanya tanya gimana cara aku negliat kamu, the way i see you. Honestly, it’s hard for me to put it all into words for you. I can’t explain directly how I see you, which is why I’m asking you to read this novel, <span className="text-[#D4AF37]">Matilda</span>, by Roald Dahl. I want you to know how Roald Dahl makes his readers see Matilda, and once you’ve read it, I’m sure you’ll understand how I saw you. mungkin kata kata yang pantes buat mewakilkan gimana cara aku ngelihat kamu tuh <span className="text-[#D4AF37]">"you showed me a power than is strong enough to bring the sun to the darkest day"</span> yg ada di lirik lagu Matilda by harry styles ini, lagu yang dulu pernah aku kasih tau ke kamu.</p>

                                                        <p>I believe that one day you’ll become a successful person, someone who achieves all your dreams. And at that point, I’ll be the happiest person on earth, because I'm one of your biggest supporter when you were at your lowest.</p>

                                                        <p>Look up at the ceiling in this 3d room, can you see the stars above?? referensinya itu saat aku bilang ke kamu “At least that we lay under the same stars.” And another reference is that perhaps I know how you see me, how you look at me as if I were the stars that shine their light in the night—but look what happens when the sun rises??? where do those stars’ lights go??? And that is the true meaning of your name. I believe you have the potential to shine even brighter than I do. So keep shining, and when you feel tired, I will illuminate your weary moments with my light.</p>
                                                        
                                                        <p>I’m not really the type of person who can truly express what I’m feeling inside, how much I love you, how much I care about you. and I’m not the type of person who can do romantic things to prove it. I have my own way of expressing it, even if I do it indirectly. And I hope you can understand that as one of my weaknesses. And maybe that weakness is what makes you overthink things or even hurts you. So instead, I’m giving you all of this so you can feel more appreciated, loved, and cared for—even if I don’t say a single word.</p>

                                                        <p>I know many things that came out of my words actually hurt you, and I’m sure the words that hurt you are still there and cross your mind even now, and I truly don’t know how to apologize. And as a form of atonement, I’ve read a lot of books (walaupun gak aku baca sampe abis) and learned how to interact with people, so there won’t be things we misunderstand because of our poor communication. I want us both to grow into better and more mature people in the future</p>

                                                        <p>I’m afraid that in the end, our relationship might not last because of our poor communication. And if that happens (semoga enggak yaa), I hope you can find someone who truly loves you with all their heart and cares for you. Someone who can be like Ms. Honey—exactly the way Ms. Honey treats Matilda. And I’ll be happy to have been a part of your life and to have been one of your biggest supporters.</p>

                                                        <p>last, everything that what happened in your life, maybe its none of my business, cause we never met yet but its really just been on my mind</p>

                                                        <div className="pt-4">
                                                            <p className="text-[#D4AF37] font-syne uppercase tracking-widest">-Keep Shining</p>
                                                            <p className="text-white/40 font-syne uppercase tracking-[0.4em] mt-1">Iyo</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="absolute bottom-6 right-6">
                                            <p className="font-syne text-xs uppercase tracking-[0.3em] text-white/20">Page Two</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal & Intro (remains similar) */}
                <AnimatePresence>
                    {selectedArt && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 md:p-12"
                        >
                            <motion.button onClick={() => setSelectedArt(null)} className="absolute top-8 right-8 text-white/50 hover:text-white">
                                <X size={32} />
                            </motion.button>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
                                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                                    <img src={selectedArt.url} alt={selectedArt.title} className="w-full h-full object-contain bg-[#0a0a0a]" />
                                </motion.div>
                                <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-8">
                                    <h2 className="font-syne text-5xl md:text-7xl font-bold text-white tracking-tighter uppercase italic">{selectedArt.title}</h2>
                                    <p className="font-outfit text-lg text-white/50 leading-relaxed max-w-md italic">
                                        {selectedArt.description || "A masterpiece from the Moonchaery Gallery, framed for eternity in the virtual abyss."}
                                    </p>
                                    <button onClick={() => setSelectedArt(null)} className="px-8 py-4 bg-purple-600 text-white font-syne font-bold text-sm rounded-full hover:bg-purple-500 transition-all uppercase tracking-widest">Back to Gallery</button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Incompatibility Overlay */}
                {!compatibility.isCompatible && compatibility.checked && (
                    <div className="absolute inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 text-center">
                        <div className="max-w-md p-10 border border-red-500/30 rounded-[40px] bg-red-500/5">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8">
                                <X className="text-red-500" size={40} />
                            </div>
                            <h2 className="font-syne text-3xl font-bold text-white mb-4 uppercase tracking-tighter">Incompatible Device</h2>
                            <p className="font-outfit text-white/60 mb-8 leading-relaxed text-sm">
                                We detected that your device may not be powerful enough to run the 3D Gallery smoothly at 60 FPS.
                                <span className="block mt-4 text-red-400/80 font-black uppercase text-[10px] tracking-widest">
                                    Reason: {compatibility.reason}
                                </span>
                            </p>
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/"
                                    className="px-10 py-4 bg-white/10 text-white rounded-full font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
                                >
                                    Return to Home
                                </Link>
                                <button
                                    onClick={() => setCompatibility({ ...compatibility, isCompatible: true })}
                                    className="text-[10px] text-white/30 uppercase tracking-[0.3em] hover:text-white transition-all underline underline-offset-4"
                                >
                                    Force Entry (Expect Frame Drops)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {showIntro && compatibility.isCompatible && (
                        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-[#050505] flex items-center justify-center flex-col gap-8">
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                                <span className="font-outfit text-[10px] font-black uppercase tracking-[1em] text-[#D4AF37] block mb-6">Entering the Gallery</span>
                                <h2 className="font-syne text-4xl md:text-6xl font-black text-white tracking-[0.2em] uppercase italic mb-8">Moonchaery 3D</h2>

                                {loading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                                        <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest">Fetching Artworks...</span>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStart}
                                        className="px-12 py-5 bg-[#D4AF37] text-black font-syne font-black text-sm rounded-full hover:bg-[#F5D76E] transition-all uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(212,175,55,0.3)]"
                                    >
                                        Start Exploration
                                    </motion.button>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Virtual Joystick */}
                {isStarted && !selectedArt && !showIntro && !isImmersionMode && typeof window !== 'undefined' && window.innerWidth < 1100 && (
                    <VirtualJoystick
                        onMove={setJoystickData}
                        onEnd={() => setJoystickData(null)}
                    />
                )}
            </main>
        </KeyboardControls>
    );
}
