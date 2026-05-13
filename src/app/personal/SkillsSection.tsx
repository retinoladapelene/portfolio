"use client";

import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    motion,
    useScroll,
    useTransform,
    useInView,
    AnimatePresence,
    useMotionValue,
    useSpring,
    useVelocity,
    PanInfo,
} from "framer-motion";
import { Layers3, Palette, Wrench, ChevronRight, Brush, Edit3, X, Box } from "lucide-react";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────
// THEME COLORS
// ─────────────────────────────────────────────────────────────
export const themeColors = [
    { id: "lilac", name: "Lilac", label: "Default", primary: "#7C3AED", light: "#EDE9FE", dot: "#A78BFA", paintHex: 0xa78bfa },
    { id: "rose", name: "Rose", label: "Blush", primary: "#E11D48", light: "#FFF1F2", dot: "#FB7185", paintHex: 0xfb7185 },
    { id: "emerald", name: "Emerald", label: "Forest", primary: "#059669", light: "#ECFDF5", dot: "#34D399", paintHex: 0x34d399 },
    { id: "amber", name: "Amber", label: "Golden", primary: "#D97706", light: "#FFFBEB", dot: "#FCD34D", paintHex: 0xfcd34d },
    { id: "obsidian", name: "Obsidian", label: "Dark", primary: "#0f0f0f", light: "#F3F3F3", dot: "#555555", paintHex: 0x222222 },
];

// Generate a <style> tag that overrides all Tailwind purple-* with theme color
export function ThemeStyleInjector({ activeThemeId }: { activeThemeId: string }) {
    const theme = themeColors.find(t => t.id === activeThemeId) || themeColors[0];

    // Map Tailwind purple shades to theme color with opacity variants
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r} ${g} ${b}`;
    };

    const rgb = hexToRgb(theme.primary);
    const dotRgb = hexToRgb(theme.dot);
    const lightRgb = hexToRgb(theme.light);

    // CSS that overrides every Tailwind purple variant globally
    const css = `
        :root {
            --theme-primary: ${theme.primary};
            --theme-primary-rgb: ${rgb};
            --theme-dot: ${theme.dot};
            --theme-dot-rgb: ${dotRgb};
            --theme-light: ${theme.light};
            --theme-light-rgb: ${lightRgb};
        }
        /* Override all Tailwind purple classes */
        .text-purple-50  { color: rgb(var(--theme-light-rgb) / 0.3) !important; }
        .text-purple-100 { color: rgb(var(--theme-light-rgb)) !important; }
        .text-purple-200 { color: rgb(var(--theme-dot-rgb) / 0.5) !important; }
        .text-purple-300 { color: rgb(var(--theme-dot-rgb) / 0.7) !important; }
        .text-purple-400 { color: rgb(var(--theme-dot-rgb)) !important; }
        .text-purple-500 { color: rgb(var(--theme-primary-rgb) / 0.8) !important; }
        .text-purple-600 { color: rgb(var(--theme-primary-rgb)) !important; }
        .text-purple-700 { color: rgb(var(--theme-primary-rgb)) !important; }
        .text-purple-800 { color: rgb(var(--theme-primary-rgb)) !important; }
        .text-purple-900 { color: rgb(var(--theme-primary-rgb)) !important; }

        /* Pseudo-elements and variants */
        .first-letter\\:text-purple-600::first-letter { color: rgb(var(--theme-primary-rgb)) !important; }

        .bg-purple-50  { background-color: rgb(var(--theme-light-rgb) / 0.4) !important; }
        .bg-purple-100 { background-color: rgb(var(--theme-light-rgb)) !important; }
        .bg-purple-200 { background-color: rgb(var(--theme-dot-rgb) / 0.35) !important; }
        .bg-purple-300 { background-color: rgb(var(--theme-dot-rgb) / 0.6) !important; }
        .bg-purple-400 { background-color: rgb(var(--theme-dot-rgb)) !important; }
        .bg-purple-500 { background-color: rgb(var(--theme-primary-rgb) / 0.8) !important; }
        .bg-purple-600 { background-color: rgb(var(--theme-primary-rgb)) !important; }
        .bg-purple-700 { background-color: rgb(var(--theme-primary-rgb)) !important; }

        .border-purple-50  { border-color: rgb(var(--theme-light-rgb) / 0.4) !important; }
        .border-purple-100 { border-color: rgb(var(--theme-light-rgb)) !important; }
        .border-purple-200 { border-color: rgb(var(--theme-dot-rgb) / 0.4) !important; }
        .border-purple-300 { border-color: rgb(var(--theme-dot-rgb) / 0.7) !important; }
        .border-purple-400 { border-color: rgb(var(--theme-dot-rgb)) !important; }
        .border-purple-600 { border-color: rgb(var(--theme-primary-rgb)) !important; }

        .from-purple-200 { --tw-gradient-from: rgb(var(--theme-dot-rgb) / 0.4) !important; }
        .from-purple-300 { --tw-gradient-from: rgb(var(--theme-dot-rgb) / 0.6) !important; }
        .from-purple-400 { --tw-gradient-from: rgb(var(--theme-dot-rgb)) !important; }
        .from-purple-500 { --tw-gradient-from: rgb(var(--theme-primary-rgb) / 0.8) !important; }
        .from-purple-600 { --tw-gradient-from: rgb(var(--theme-primary-rgb)) !important; }
        .to-purple-300   { --tw-gradient-to: rgb(var(--theme-dot-rgb) / 0.6) !important; }
        .to-purple-400   { --tw-gradient-to: rgb(var(--theme-dot-rgb)) !important; }
        .to-purple-600   { --tw-gradient-to: rgb(var(--theme-primary-rgb)) !important; }

        /* Opacity variants */
        .text-purple-600\\/60 { color: rgb(var(--theme-primary-rgb) / 0.6) !important; }
        .text-purple-600\\/50 { color: rgb(var(--theme-primary-rgb) / 0.5) !important; }
        .text-purple-600\\/40 { color: rgb(var(--theme-primary-rgb) / 0.4) !important; }
        .text-purple-600\\/\\[0\\.04\\] { color: rgb(var(--theme-primary-rgb) / 0.04) !important; }
        .text-purple-500\\/30 { color: rgb(var(--theme-primary-rgb) / 0.3) !important; }
        .text-purple-400\\/20 { color: rgb(var(--theme-dot-rgb) / 0.2) !important; }
        .text-purple-400\\/30 { color: rgb(var(--theme-dot-rgb) / 0.3) !important; }
        .bg-purple-600\\/20  { background-color: rgb(var(--theme-primary-rgb) / 0.2) !important; }
        .bg-purple-400\\/10  { background-color: rgb(var(--theme-dot-rgb) / 0.1) !important; }
        .bg-purple-400\\/40  { background-color: rgb(var(--theme-dot-rgb) / 0.4) !important; }
        .border-purple-400\\/10 { border-color: rgb(var(--theme-dot-rgb) / 0.1) !important; }
        .border-purple-400\\/20 { border-color: rgb(var(--theme-dot-rgb) / 0.2) !important; }
        .border-purple-400\\/40 { border-color: rgb(var(--theme-dot-rgb) / 0.4) !important; }
        .border-purple-100\\/80 { border-color: rgb(var(--theme-light-rgb) / 0.8) !important; }
        .from-purple-400\\/40 { --tw-gradient-from: rgb(var(--theme-dot-rgb) / 0.4) !important; }

        /* hover: variants */
        .hover\\:text-purple-800:hover { color: rgb(var(--theme-primary-rgb)) !important; }
        .hover\\:border-purple-300:hover { border-color: rgb(var(--theme-dot-rgb) / 0.7) !important; }
        .group:hover .group-hover\\:text-purple-600 { color: rgb(var(--theme-primary-rgb)) !important; }
        .group:hover .group-hover\\:bg-purple-400\\/40 { background-color: rgb(var(--theme-dot-rgb) / 0.4) !important; }
        .group:hover .group-hover\\:border-purple-400\\/30 { border-color: rgb(var(--theme-dot-rgb) / 0.3) !important; }
        .text-purple-600\\/80 { color: rgb(var(--theme-primary-rgb) / 0.8) !important; }
        .text-purple-900\\/80 { color: rgb(var(--theme-primary-rgb) / 0.8) !important; }
        .text-purple-600\\/40 { color: rgb(var(--theme-primary-rgb) / 0.4) !important; }
        .text-purple-600\\/30 { color: rgb(var(--theme-primary-rgb) / 0.3) !important; }

        :root {
            --theme-shadow-rgb: ${rgb};
        }

        /* Selection highlight */
        .selection\\:bg-purple-500\\/30 ::selection,
        .selection\\:bg-purple-500\\/30::selection { background: rgb(var(--theme-primary-rgb) / 0.3) !important; }

        /* Drop shadow utilities */
        .drop-shadow-md { filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06)); }

        /* Radial gradient overrides */
        .bg-radial-gradient.from-purple-200\\/50 { background: radial-gradient(ellipse at center, rgb(var(--theme-dot-rgb) / 0.5) 0%, transparent 70%) !important; }
        .bg-radial-gradient.from-purple-100\\/30 { background: radial-gradient(ellipse at center, rgb(var(--theme-light-rgb) / 0.3) 0%, transparent 70%) !important; }
    `;

    return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// ─────────────────────────────────────────────────────────────
// TOOL DATA
// ─────────────────────────────────────────────────────────────
const tools = [
    { id: "procreate", name: "Procreate", category: "Primary", usage: 92, desc: "Main canvas for character sketching & final illustration", color: "#7C3AED", light: "#EDE9FE", dot: "#A78BFA", side: "left", tasks: ["Sketching", "Inking", "Coloring"] },
    { id: "photoshop", name: "Photoshop", category: "Compositing", usage: 78, desc: "Photo manipulation, texture overlay & final compositing", color: "#1A56DB", light: "#EBF5FF", dot: "#76A9FA", side: "left", tasks: ["Compositing", "FX", "Export"] },
    { id: "clipstudio", name: "Clip Studio", category: "Linework", usage: 65, desc: "Precision linework and manga-style illustration panels", color: "#0F766E", light: "#F0FDF4", dot: "#34D399", side: "right", tasks: ["Lineart", "Panels", "Manga"] },
    { id: "blender", name: "Blender", category: "3D / Ref", usage: 45, desc: "3D model references for complex character poses & props", color: "#B45309", light: "#FFFBEB", dot: "#F59E0B", side: "right", tasks: ["3D Ref", "Modeling", "Lighting"] },
];

const allSkills = ["Character Design", "Digital Illustration", "Concept Art", "Commission Art", "High-Fidelity Render", "Visual Storytelling", "Color Theory", "Anatomy Study", "World Building"];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function SplitReveal({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <span ref={ref} className={`inline-block overflow-hidden ${className}`} aria-label={text}>
            <span className="inline-flex flex-wrap">
                {text.split("").map((char, i) => (
                    <motion.span key={i} initial={{ y: "110%", opacity: 0 }}
                        animate={inView ? { y: "0%", opacity: 1 } : {}}
                        transition={{ duration: 0.65, delay: delay + i * 0.028, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                        {char}
                    </motion.span>
                ))}
            </span>
        </span>
    );
}

function SkillMarquee({ skills, theme }: { skills: string[]; theme: typeof themeColors[0] }) {
    const doubled = [...skills, ...skills, ...skills, ...skills];
    return (
        <div className="overflow-hidden py-3">
            <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="flex gap-3 whitespace-nowrap w-max">
                {doubled.map((skill, i) => (
                    <span key={i} className="px-4 py-1.5 rounded-full border font-outfit text-[9px] font-black uppercase tracking-[0.35em] flex-shrink-0 transition-colors duration-500"
                        style={{ borderColor: `${theme.primary}30`, background: `${theme.light}90`, color: `${theme.primary}BB` }}>
                        {skill}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

function ToolIndicator({ tool, index, side, onHover, theme }: {
    tool: typeof tools[0]; index: number; side: "left" | "right";
    onHover: (c: string | null) => void; theme: typeof themeColors[0];
}) {
    const [hovered, setHovered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    const getIcon = () => {
        const s = 18;
        if (tool.id === "procreate") return <Palette size={s} />;
        if (tool.id === "photoshop") return <Layers3 size={s} />;
        if (tool.id === "clipstudio") return <Edit3 size={s} />;
        if (tool.id === "blender") return <Box size={s} />;
        return <Wrench size={s} />;
    };

    return (
        <motion.div ref={ref} initial={{ opacity: 0, x: side === "left" ? -40 : 40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => { setHovered(true); onHover(tool.color); }}
            onMouseLeave={() => { setHovered(false); onHover(null); }}
            className="relative cursor-default">
            <motion.div animate={{ boxShadow: hovered ? `0 16px 48px -8px ${tool.color}30` : "none", y: hovered ? -3 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-white border border-purple-50 p-4 md:p-6">
                <motion.div animate={{ opacity: hovered ? 1 : 0 }} className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl"
                    style={{ background: `linear-gradient(135deg, ${tool.color}08, ${tool.color}18)` }} />
                <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
                    <div>
                        <div className="inline-block font-outfit text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
                            style={{ background: tool.light, color: tool.color }}>{tool.category}</div>
                        <div className="flex items-center gap-2">
                            <div style={{ color: tool.color }}>{getIcon()}</div>
                            <h5 className="font-syne text-base md:text-xl font-bold leading-none text-[#1A1F2B]">{tool.name}</h5>
                        </div>
                    </div>
                    <div className="relative flex-shrink-0 mt-1">
                        <div className="w-3 h-3 rounded-full" style={{ background: tool.dot }} />
                        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
                            className="absolute inset-0 rounded-full" style={{ background: tool.dot }} />
                    </div>
                </div>
                <div className="relative z-10 mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="font-outfit text-[8px] font-black uppercase tracking-widest text-[#1A1F2B]/30">Usage</span>
                        <span className="font-syne text-xs font-bold" style={{ color: tool.color }}>{tool.usage}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-purple-50 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={inView ? { width: `${tool.usage}%` } : {}}
                            transition={{ duration: 1.2, delay: index * 0.15 + 0.3, ease: "circOut" }}
                            className="h-full rounded-full" style={{ background: `linear-gradient(to right, ${tool.color}, ${tool.dot})` }} />
                    </div>
                </div>
                <p className="hidden md:block relative z-10 font-outfit text-[11px] text-[#1A1F2B]/45 leading-relaxed mb-3">{tool.desc}</p>
                <div className="relative z-10 flex flex-wrap gap-1.5">
                    {tool.tasks.map(task => (
                        <span key={task} className="font-outfit text-[7px] md:text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: tool.light, color: tool.color }}>{task}</span>
                    ))}
                </div>
                <motion.div animate={{ width: hovered ? "100%" : "0%", opacity: hovered ? 0.4 : 0 }} transition={{ duration: 0.5 }}
                    className="absolute bottom-0 left-0 h-[2px] rounded-bl-3xl" style={{ background: tool.color }} />
            </motion.div>
            <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-px w-6 pointer-events-none opacity-30 ${side === "left" ? "-right-6" : "-left-6"}`}
                style={{ background: tool.color }} />
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────
// BRUSH CANVAS (preserved from user's original)
// ─────────────────────────────────────────────────────────────
const BrushCanvas = memo(({ 
    activeColor, 
    homeBoxRefs, 
    sectionRef, 
    onPositionUpdate, 
    onDraggingStateChange, 
    isDrawingEnabled,
    theme,
    activeTab
}: { 
    activeColor: string | null; 
    homeBoxRefs: React.RefObject<HTMLDivElement | null>[]; 
    sectionRef: React.RefObject<HTMLElement | null>; 
    onPositionUpdate?: (x: number, y: number) => void; 
    onDraggingStateChange?: (v: boolean) => void; 
    isDrawingEnabled: boolean; 
    theme: typeof themeColors[0];
    activeTab: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number | null>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const activeColorRef = useRef(activeColor);
    const isDraggingRef = useRef(false);
    const brushPosRef = useRef({ x: 0, y: 0, z: 0 });
    const targetPosRef = useRef({ x: 0, y: 0, z: 0 });
    const isDrawingEnabledRef = useRef(isDrawingEnabled);
    const lastUpdatePosRef = useRef({ x: 0, y: 0 });
    const onPositionUpdateRef = useRef(onPositionUpdate);
    const themeRef = useRef(theme);
    const inView = useInView(sectionRef, { margin: "0px" });
    const isTabActive = activeTab === 0;

    useEffect(() => { activeColorRef.current = activeColor; }, [activeColor]);
    useEffect(() => { isDrawingEnabledRef.current = isDrawingEnabled; }, [isDrawingEnabled]);
    useEffect(() => { onPositionUpdateRef.current = onPositionUpdate; }, [onPositionUpdate]);
    useEffect(() => { themeRef.current = theme; }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !sectionRef.current) return;
        
        let renderer: any, scene: any, camera: any, brush: any, THREE: any, bristleMesh: any, handleMesh: any;
        let destroyed = false;
        let lastMouse = { x: 0, y: 0 };
        let mouseVel = { x: 0, y: 0 };
        let currentColor: any = null;

        const load = async () => {
            // @ts-ignore
            THREE = await import("three");
            if (destroyed) return;
            currentColor = new THREE.Color(theme.primary);
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 0, 15);
            const key = new THREE.DirectionalLight(0xffffff, 4.0); key.position.set(5, 5, 5); scene.add(key);
            const rim = new THREE.DirectionalLight(0xffffff, 2.0); rim.position.set(-5, -5, 2); scene.add(rim);
            scene.add(new THREE.AmbientLight(0xffffff, 1.0));
            const ferruleRadius = 0.11;
            const bMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
            bristleMesh = new THREE.Mesh(new THREE.LatheGeometry(
                [[ferruleRadius - 0.01, 0], [0.15, 0.15], [0.18, 0.35], [0.16, 0.6], [0.1, 0.9], [0.04, 1.15], [0, 1.35]].map(p => new THREE.Vector2(p[0], p[1])), 64
            ), bMat);
            const fMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.1, metalness: 0.9 });
            const ferruleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 48), fMat);
            ferruleMesh.position.y = 0.35;
            const hMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0.05 });
            handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.04, 4.0, 48), hMat);
            handleMesh.position.y = -1.9; 
            bristleMesh.position.y = 0.55;
            brush = new THREE.Group();
            brush.add(handleMesh);
            brush.add(bristleMesh);
            brush.add(ferruleMesh);
            brush.scale.setScalar(0.8); scene.add(brush);

            const getHomePos = () => {
                // Find the visible box (mobile or desktop)
                const activeBox = homeBoxRefs.find(ref => {
                    const el = ref.current;
                    if (!el) return false;
                    return el.offsetParent !== null || el.getClientRects().length > 0;
                })?.current;

                const hRect = activeBox?.getBoundingClientRect();
                if (!hRect) return { x: 0, y: 0 };
                
                // Calculate position relative to viewport center
                const cx = (hRect.left + hRect.width / 2) - (window.innerWidth / 2);
                const cy = (window.innerHeight / 2) - (hRect.top + hRect.height / 2);
                
                const vFOV = (camera.fov * Math.PI) / 180;
                const fH = 2 * Math.tan(vFOV / 2) * 15;
                const fW = fH * (window.innerWidth / window.innerHeight);
                
                // y mapping: Brush visual center adjustment
                // The brush extends from approx -3.9 to 1.2 relative to origin. 
                // Adding +1.3 ensures the visual center of the brush is at the target Y.
                const targetX = (cx / window.innerWidth) * fW;
                // With scale 0.8 and camera at 15, +1.1 provides the best visual balance
                const targetY = (cy / window.innerHeight) * fH + 1.1;
                return { x: targetX, y: targetY };
            };
            const init = getHomePos();
            brushPosRef.current = { ...init, z: 0 };
            targetPosRef.current = { ...init, z: 0 };

            const animate = () => {
                if (destroyed) return;
                animRef.current = requestAnimationFrame(animate);
                const tgt = new THREE.Color(activeColorRef.current || themeRef.current.primary);
                currentColor.lerp(tgt, 0.1);
                bristleMesh.material.color.set(0xffffff);
                handleMesh.material.color.copy(currentColor);
                const home = getHomePos();
                const vFOV = (camera.fov * Math.PI) / 180;
                const h = 2 * Math.tan(vFOV / 2) * 15;
                const w = h * (window.innerWidth / window.innerHeight);
                if (isDrawingEnabledRef.current) {
                    targetPosRef.current.x = mouseRef.current.x * (w / 2);
                    targetPosRef.current.y = mouseRef.current.y * (h / 2);
                } else {
                    targetPosRef.current.x = home.x;
                    targetPosRef.current.y = home.y;
                }
                brushPosRef.current.x += (targetPosRef.current.x - brushPosRef.current.x) * 0.12;
                brushPosRef.current.y += (targetPosRef.current.y - brushPosRef.current.y) * 0.12;
                brush.position.set(brushPosRef.current.x, brushPosRef.current.y, 0);
                mouseVel.x = mouseRef.current.x - lastMouse.x;
                mouseVel.y = mouseRef.current.y - lastMouse.y;
                lastMouse.x += (mouseRef.current.x - lastMouse.x) * 0.15;
                lastMouse.y += (mouseRef.current.y - lastMouse.y) * 0.15;
                const tilt = isDrawingEnabledRef.current ? 3.5 : 1.0;
                brush.rotation.x += (mouseVel.y * 2.5 * tilt - brush.rotation.x) * 0.1;
                brush.rotation.y += (mouseRef.current.x * 0.6 - brush.rotation.y) * 0.1;
                brush.rotation.z += (-mouseVel.x * 2.5 * tilt - brush.rotation.z) * 0.1;
                
                // Dynamic scaling when grabbing
                const targetScale = isDraggingRef.current ? 1.05 : 0.95;
                brush.scale.setScalar(brush.scale.x + (targetScale - brush.scale.x) * 0.1);

                // Add flexibility (bending) to the bristles based on velocity
                const bendFactor = isDrawingEnabledRef.current ? 6.5 : 2.5;
                bristleMesh.rotation.x += (mouseVel.y * bendFactor - bristleMesh.rotation.x) * 0.06;
                bristleMesh.rotation.z += (-mouseVel.x * bendFactor - bristleMesh.rotation.z) * 0.06;
                
                // Add slight squash and stretch for "lentur" feel
                const speed = Math.sqrt(mouseVel.x * mouseVel.x + mouseVel.y * mouseVel.y);
                const squash = 1 + speed * 2.0;
                bristleMesh.scale.set(1/squash, squash, 1/squash);

                brush.updateMatrixWorld();
                if (isDrawingEnabledRef.current && onPositionUpdateRef.current && sectionRef.current) {
                    const tipPos = new THREE.Vector3(0, 1.9, 0).applyMatrix4(brush.matrixWorld);
                    const v = tipPos.clone().project(camera);
                    const sRect = sectionRef.current.getBoundingClientRect();
                    
                    // Map tip from viewport NDC to section-relative pixels
                    // v.x/y is in range [-1, 1] relative to viewport center
                    const px = Math.round((v.x * 0.5 + 0.5) * window.innerWidth - sRect.left);
                    const py = Math.round((-v.y * 0.5 + 0.5) * window.innerHeight - sRect.top);
                    
                    // Throttling: only update if moved at least 2 pixels to avoid setState loop
                    const dx = px - lastUpdatePosRef.current.x;
                    const dy = py - lastUpdatePosRef.current.y;
                    if (Math.sqrt(dx * dx + dy * dy) > 2) {
                        onPositionUpdateRef.current(px, py);
                        lastUpdatePosRef.current = { x: px, y: py };
                    }
                }
                renderer.render(scene, camera);
            };
            animate();
            const ro = new ResizeObserver(() => {
                if (!canvas) return;
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            });
            ro.observe(canvas);
        };
        load();

        const onPointerMove = (e: PointerEvent) => {
            // Use viewport-relative NDC for 1:1 tracking
            mouseRef.current = { 
                x: (e.clientX / window.innerWidth - 0.5) * 2, 
                y: -(e.clientY / window.innerHeight - 0.5) * 2 
            };
        };
        const onPointerDown = (e: PointerEvent) => {
            if (!isDrawingEnabledRef.current) return;
            const sRect = sectionRef.current?.getBoundingClientRect();
            if (!sRect) return;
            
            // Calculate mouse pos relative to section center in NDC-like units
            const px = ((e.clientX - sRect.left) / sRect.width - 0.5) * 2;
            const py = -((e.clientY - sRect.top) / sRect.height - 0.5) * 2;
            
            // Hit test against brush position
            const dx = px * 5 - brushPosRef.current.x;
            const dy = py * 5 - brushPosRef.current.y;
            
            // Increased hit area for easier grabbing
            if (Math.sqrt(dx * dx + dy * dy) < 4.5) {
                isDraggingRef.current = true;
                if (onDraggingStateChange) onDraggingStateChange(true);
                if (brush) brush.scale.setScalar(1.0);
            }
        };
        const onPointerUp = () => {
            isDraggingRef.current = false;
            if (onDraggingStateChange) onDraggingStateChange(false);
            if (brush) brush.scale.setScalar(0.9);
        };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointerup", onPointerUp);
        return () => {
            destroyed = true;
            if (animRef.current) cancelAnimationFrame(animRef.current);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            if (renderer) renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} 
        className={`fixed inset-0 w-full h-full z-[100000] pointer-events-none transition-opacity duration-500 ${inView && isTabActive ? "opacity-100" : "opacity-0"}`} 
        style={{ display: "block", touchAction: "none" }} />;
});

// Set display name for memoized component
BrushCanvas.displayName = "BrushCanvas";

// ─────────────────────────────────────────────────────────────
// PALETTE 3D CANVAS
// ─────────────────────────────────────────────────────────────
function PaletteCanvas({ activeThemeId, onColorClick }: { activeThemeId: string; onColorClick: (id: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number | null>(null);
    const activeThemeIdRef = useRef(activeThemeId);
    const threeRef = useRef<any>(null);
    // Drag state for 360 rotation
    const dragRef = useRef({ isDragging: false, prevX: 0, prevY: 0, rotY: 0.3, rotX: -0.4, velocityY: 0, velocityX: 0 });

    useEffect(() => { activeThemeIdRef.current = activeThemeId; }, [activeThemeId]);

    const handleClick = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        const r = threeRef.current;
        if (!canvas || !r) return;
        // Only fire click if we weren't dragging
        if (Math.abs(dragRef.current.velocityY) > 0.002 || Math.abs(dragRef.current.velocityX) > 0.002) return;
        const { THREE, camera, paintMeshes } = r;
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(paintMeshes, false);
        if (hits.length > 0) {
            const idx = paintMeshes.indexOf(hits[0].object);
            if (idx >= 0) onColorClick(themeColors[idx].id);
        }
    }, [onColorClick]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let destroyed = false;

        const load = async () => {
            // @ts-ignore
            const THREE = await import("three");
            if (destroyed) return;

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setClearColor(0x000000, 0);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.4;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(36, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 8.5);
            camera.lookAt(0, 0, 0);

            // Warm studio lighting
            scene.add(new THREE.AmbientLight(0xfff8f0, 0.7));
            const key = new THREE.DirectionalLight(0xffffff, 2.5); key.position.set(3, 5, 6); scene.add(key);
            const fill = new THREE.DirectionalLight(0xffeedd, 1.0); fill.position.set(-4, 2, 4); scene.add(fill);
            const back = new THREE.DirectionalLight(0xffe0c0, 0.5); back.position.set(0, -3, -3); scene.add(back);
            const point = new THREE.PointLight(0xfff0dd, 1.5, 16); point.position.set(2, 4, 5); scene.add(point);

            const paletteGroup = new THREE.Group();

            // ── PALETTE BODY ──
            const paletteMat = new THREE.MeshStandardMaterial({
                color: 0xc89b5e,
                roughness: 0.55,
                metalness: 0.0,
                emissive: 0x2a1500,
                emissiveIntensity: 0.06,
            });
            const paletteBackMat = new THREE.MeshStandardMaterial({
                color: 0xa07840,
                roughness: 0.65,
                metalness: 0.0,
                emissive: 0x1a0e00,
                emissiveIntensity: 0.04,
            });

            // Clean egg/teardrop: wide left, tapers right — 6 smooth bezier curves
            const ps = new THREE.Shape();
            ps.moveTo(2.2, 0);
            // Upper-right → top
            ps.bezierCurveTo(2.2, 1.0, 1.5, 1.9, 0.3, 2.1);
            // Top → upper-left
            ps.bezierCurveTo(-0.8, 2.3, -2.0, 1.8, -2.5, 1.0);
            // Left side down (widest)
            ps.bezierCurveTo(-3.0, 0.2, -3.0, -0.6, -2.5, -1.2);
            // Lower-left → bottom
            ps.bezierCurveTo(-2.0, -1.8, -0.8, -2.3, 0.3, -2.1);
            // Bottom → lower-right
            ps.bezierCurveTo(1.5, -1.9, 2.2, -1.0, 2.2, 0);

            // Thumb hole — upper-right area
            const thumbHole = new THREE.Path();
            thumbHole.ellipse(0.8, 0.7, 0.3, 0.38, 0, Math.PI * 2, false, 0);
            ps.holes.push(thumbHole);

            const extOpts = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 5 };
            const paletteGeo = new THREE.ExtrudeGeometry(ps, extOpts);
            paletteGeo.center();
            const paletteMesh = new THREE.Mesh(paletteGeo, paletteMat);
            paletteGroup.add(paletteMesh);

            // Back face (visible during 360° rotation)
            const backGeo = new THREE.ExtrudeGeometry(ps, { depth: 0.01, bevelEnabled: false });
            backGeo.center();
            const backMesh = new THREE.Mesh(backGeo, paletteBackMat);
            backMesh.position.z = -0.14;
            paletteGroup.add(backMesh);

            // ── PAINT BLOBS — C-arc along the left edge ──
            const paintMeshes: any[] = [];
            const ringGeos: { ring: any; idx: number }[] = [];

            // 5 blobs along the left curve, evenly spaced in an arc
            // Using the palette's left edge curve as guide:
            //   top-center → upper-left → mid-left → lower-left → bottom-center
            const blobSpots = [
                { x: -0.1, y:  1.5 },   // lilac — top
                { x: -1.5, y:  1.0 },   // rose — upper-left
                { x: -2.0, y: -0.1 },   // emerald — mid-left (widest point)
                { x: -1.5, y: -1.2 },   // amber — lower-left
                { x: -0.1, y: -1.6 },   // obsidian — bottom
            ];

            themeColors.forEach((tc, i) => {
                const spot = blobSpots[i];

                // Paint dollop: sphere squished flat on back, domed on front
                const blobGeo = new THREE.SphereGeometry(0.38, 32, 24);
                const bPos = blobGeo.attributes.position;
                for (let v = 0; v < bPos.count; v++) {
                    const z = bPos.getZ(v);
                    bPos.setZ(v, z > 0 ? z * 0.55 : z * 0.05);
                }
                bPos.needsUpdate = true;
                blobGeo.computeVertexNormals();

                const isObsidian = tc.id === "obsidian";
                const blobMat = new THREE.MeshStandardMaterial({
                    color: tc.paintHex,
                    roughness: isObsidian ? 0.3 : 0.12,
                    metalness: isObsidian ? 0.45 : 0.2,
                    emissive: tc.paintHex,
                    emissiveIntensity: isObsidian ? 0.03 : 0.1,
                });

                const blob = new THREE.Mesh(blobGeo, blobMat);
                blob.position.set(spot.x, spot.y, 0.14);
                blob.userData.themeId = tc.id;
                paletteGroup.add(blob);
                paintMeshes.push(blob);

                // Selection ring
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(0.44, 0.018, 8, 32),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff, transparent: true, opacity: 0,
                        roughness: 0.1, metalness: 0.6,
                    })
                );
                ring.position.set(spot.x, spot.y, 0.16);
                paletteGroup.add(ring);
                ringGeos.push({ ring, idx: i });
            });

            // ── Scale & position ──
            paletteGroup.scale.setScalar(1.0);
            scene.add(paletteGroup);

            // Apply initial rotation from dragRef
            paletteGroup.rotation.y = dragRef.current.rotY;
            paletteGroup.rotation.x = dragRef.current.rotX;

            threeRef.current = { THREE, camera, paintMeshes, scene };

            // ── ANIMATION LOOP ──
            let t = 0;
            const animate = () => {
                if (destroyed) return;
                animRef.current = requestAnimationFrame(animate);
                t += 0.008;

                const dr = dragRef.current;

                if (!dr.isDragging) {
                    // Apply inertia when not dragging
                    dr.velocityY *= 0.95;
                    dr.velocityX *= 0.95;
                    dr.rotY += dr.velocityY;
                    dr.rotX += dr.velocityX;
                    // Clamp vertical rotation to avoid flipping
                    dr.rotX = Math.max(-1.2, Math.min(0.6, dr.rotX));
                    // Add subtle idle float
                    paletteGroup.rotation.y = dr.rotY + Math.sin(t * 0.25) * 0.02;
                    paletteGroup.rotation.x = dr.rotX + Math.cos(t * 0.2) * 0.01;
                } else {
                    paletteGroup.rotation.y = dr.rotY;
                    paletteGroup.rotation.x = dr.rotX;
                }

                // Active theme highlight
                const cId = activeThemeIdRef.current;
                ringGeos.forEach(({ ring, idx }) => {
                    const isActive = themeColors[idx].id === cId;
                    ring.material.opacity += ((isActive ? 0.85 : 0) - ring.material.opacity) * 0.1;
                    ring.material.color.setHex(themeColors[idx].paintHex);
                    paintMeshes[idx].position.z += ((isActive ? 0.24 : 0.14) - paintMeshes[idx].position.z) * 0.1;
                    const s = 1 + (isActive ? 0.15 : 0) * Math.sin(t * 3);
                    paintMeshes[idx].scale.setScalar(s);
                });

                renderer.render(scene, camera);
            };
            animate();

            // ── DRAG TO ROTATE (mouse + touch) ──
            const onPointerDown = (e: PointerEvent) => {
                dragRef.current.isDragging = true;
                dragRef.current.prevX = e.clientX;
                dragRef.current.prevY = e.clientY;
                dragRef.current.velocityY = 0;
                dragRef.current.velocityX = 0;
                canvas.setPointerCapture(e.pointerId);
            };
            const onPointerMove = (e: PointerEvent) => {
                const dr = dragRef.current;
                if (!dr.isDragging) return;
                const dx = e.clientX - dr.prevX;
                const dy = e.clientY - dr.prevY;
                dr.velocityY = dx * 0.008;
                dr.velocityX = dy * 0.005;
                dr.rotY += dr.velocityY;
                dr.rotX += dr.velocityX;
                dr.rotX = Math.max(-1.2, Math.min(0.6, dr.rotX));
                dr.prevX = e.clientX;
                dr.prevY = e.clientY;
            };
            const onPointerUp = (e: PointerEvent) => {
                dragRef.current.isDragging = false;
                canvas.releasePointerCapture(e.pointerId);
            };
            canvas.addEventListener("pointerdown", onPointerDown);
            canvas.addEventListener("pointermove", onPointerMove);
            canvas.addEventListener("pointerup", onPointerUp);
            canvas.addEventListener("pointercancel", onPointerUp);

            // Resize
            const ro = new ResizeObserver(() => {
                if (!canvas || destroyed) return;
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            });
            ro.observe(canvas);
        };

        load();
        canvas.addEventListener("click", handleClick);

        return () => {
            destroyed = true;
            if (animRef.current) cancelAnimationFrame(animRef.current);
            canvas.removeEventListener("click", handleClick);
        };
    }, [handleClick]);

    return <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ display: "block", touchAction: "none" }} />;
}

// ─────────────────────────────────────────────────────────────
// PALETTE TAB
// ─────────────────────────────────────────────────────────────
function PaletteTab({ activeThemeId, onThemeChange }: { activeThemeId: string; onThemeChange: (id: string) => void }) {
    const activeTheme = themeColors.find(t => t.id === activeThemeId) || themeColors[0];
    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center min-h-[480px] md:min-h-[520px]">
            {/* 3D Palette */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full md:w-[52%] flex-shrink-0" style={{ height: "clamp(280px, 42vw, 460px)" }}>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <motion.div animate={{ opacity: 1 }} className="w-full h-full rounded-3xl transition-all duration-700"
                        style={{ background: `radial-gradient(ellipse at center, ${activeTheme.dot}18 0%, transparent 70%)` }} />
                </div>
                <PaletteCanvas activeThemeId={activeThemeId} onColorClick={onThemeChange} />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/75 backdrop-blur-sm border border-purple-100 pointer-events-none whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: activeTheme.primary }} />
                    <span className="font-outfit text-[8px] font-black uppercase tracking-widest" style={{ color: activeTheme.primary }}>
                        Tap a color to switch theme
                    </span>
                </div>
            </motion.div>

            {/* Right: info + swatches */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                className="flex-1 flex flex-col gap-6 w-full">
                {/* Active theme */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeThemeId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                        <div className="font-outfit text-[9px] font-black uppercase tracking-[0.5em] mb-2 transition-colors duration-500"
                            style={{ color: activeTheme.primary }}>Active Theme</div>
                        <h3 className="font-syne text-3xl md:text-4xl font-bold text-[#1A1F2B] leading-none mb-2">
                            {activeTheme.name}
                            <span className="ml-3 font-outfit text-sm font-medium opacity-30">#{activeTheme.label}</span>
                        </h3>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="w-8 h-8 rounded-xl shadow-lg border-2 border-white" style={{ background: activeTheme.primary }} />
                            <div className="w-6 h-6 rounded-lg shadow" style={{ background: activeTheme.dot }} />
                            <div className="w-5 h-5 rounded-lg shadow" style={{ background: activeTheme.light }} />
                            <span className="font-outfit text-xs text-[#1A1F2B]/40 font-mono ml-1">{activeTheme.primary}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Swatches */}
                <div>
                    <div className="font-outfit text-[9px] font-black uppercase tracking-[0.4em] text-[#1A1F2B]/30 mb-4">Color Palette</div>
                    <div className="grid grid-cols-5 gap-2 md:gap-3">
                        {themeColors.map(tc => (
                            <motion.button key={tc.id} onClick={() => onThemeChange(tc.id)}
                                whileHover={{ y: -4, scale: 1.06 }} whileTap={{ scale: 0.94 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="relative flex flex-col items-center gap-2">
                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl shadow-md border-2 transition-all duration-300"
                                    style={{
                                        background: `radial-gradient(ellipse at 35% 35%, ${tc.dot}, ${tc.primary})`,
                                        borderColor: tc.id === activeThemeId ? tc.primary : "white",
                                        boxShadow: tc.id === activeThemeId ? `0 8px 24px -4px ${tc.primary}55` : undefined,
                                    }}>
                                    {tc.id === activeThemeId && (
                                        <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                                        </div>
                                    )}
                                </div>
                                <span className="font-outfit text-[8px] font-bold text-center text-[#1A1F2B]/50">{tc.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Preview strip */}
                <AnimatePresence mode="wait">
                    <motion.div key={`prev-${activeThemeId}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl overflow-hidden border"
                        style={{ borderColor: `${activeTheme.primary}25` }}>
                        <div className="p-4" style={{ background: activeTheme.light }}>
                            <div className="font-outfit text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: activeTheme.primary }}>Preview</div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: activeTheme.primary }}>
                                    <Palette size={14} color="white" />
                                </div>
                                <div>
                                    <div className="font-syne font-bold text-sm" style={{ color: activeTheme.primary }}>{activeTheme.name} Theme</div>
                                    <div className="font-outfit text-[10px]" style={{ color: `${activeTheme.primary}80` }}>Personal Index · {activeTheme.label}</div>
                                </div>
                                <div className="ml-auto px-3 py-1 rounded-full font-outfit text-[8px] font-black uppercase tracking-widest text-white"
                                    style={{ background: activeTheme.primary }}>Active</div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TAB SWITCHER
// ─────────────────────────────────────────────────────────────
function TabSwitcher({ activeTab, onTabChange, theme }: {
    activeTab: 0 | 1; onTabChange: (tab: 0 | 1) => void; theme: typeof themeColors[0];
}) {
    return (
        <div className="relative flex items-center gap-1 p-1 rounded-2xl border w-fit"
            style={{ background: theme.light, borderColor: `${theme.primary}20` }}>
            <motion.div layoutId="tab-indicator" className="absolute rounded-xl inset-y-1 transition-colors duration-500"
                style={{ background: theme.primary, width: "calc(50% - 4px)", left: activeTab === 0 ? "4px" : "calc(50%)" }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }} />
            {[{ icon: <Wrench size={12} />, label: "Tools & Kit" }, { icon: <Palette size={12} />, label: "Color Palette" }].map((tab, i) => (
                <button key={i} onClick={() => onTabChange(i as 0 | 1)}
                    className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl font-outfit text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
                    style={{ color: activeTab === i ? "white" : `${theme.primary}80` }}>
                    {tab.icon}{tab.label}
                </button>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// METHODOLOGY GRID
// ─────────────────────────────────────────────────────────────
const methodology = [
    { step: "01", title: "Moodboard", desc: "Building a visual foundation through extensive character and color research." },
    { step: "02", title: "Sketch Pass", desc: "Translating ideas into dynamic lines and artistic compositions." },
    { step: "03", title: "Final Polish", desc: "High-fidelity rendering with a focus on lighting and the character's soul." },
];

function MethodologyGrid({ theme }: { theme: typeof themeColors[0] }) {
    return (
        <div className="methodology-trigger mt-8 md:mt-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex items-center gap-6 mb-10 md:mb-14">
                <h3 className="font-syne text-2xl md:text-4xl font-bold text-[#1A1F2B] tracking-tight flex-shrink-0">The Methodology</h3>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${theme.primary}40, transparent)` }} />
                <span className="font-outfit text-[9px] font-black uppercase tracking-[0.4em] text-[#1A1F2B]/20 hidden sm:inline flex-shrink-0">Creative Flow</span>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {methodology.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                        className="methodology-card-morph group relative overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm border p-7 md:p-10 hover:bg-white/80 hover:shadow-xl transition-all duration-500"
                        style={{ borderColor: `${theme.primary}20` }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = `${theme.primary}50`)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = `${theme.primary}20`)}>
                        <div className="absolute -top-6 -right-4 font-syne text-[100px] md:text-[120px] font-black select-none leading-none pointer-events-none"
                            style={{ color: `${theme.primary}07` }}>{item.step}</div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-syne font-black text-xs transition-all duration-300 group-hover:text-white group-hover:border-current"
                                    style={{ borderColor: `${theme.primary}50`, color: theme.primary }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = theme.primary; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; }}>
                                    {item.step}
                                </div>
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${theme.primary}40, transparent)` }} />
                            </div>
                            <h5 className="font-syne text-lg md:text-2xl font-bold text-[#1A1F2B] transition-colors duration-300" style={{}}>{item.title}</h5>
                            <p className="font-outfit text-sm text-[#1A1F2B]/50 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 rounded-b-3xl"
                            style={{ background: theme.primary }} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function SkillsSection({
    onThemeChange,
    activeThemeId = "lilac",
}: {
    onThemeChange?: (themeId: string) => void;
    activeThemeId?: string;
}) {
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const brushBoxMobileRef = useRef<HTMLDivElement>(null);
    const brushBoxDesktopRef = useRef<HTMLDivElement>(null);

    const maskX = useMotionValue(0);
    const maskY = useMotionValue(0);
    const springX = useSpring(maskX, { stiffness: 400, damping: 60 });
    const springY = useSpring(maskY, { stiffness: 400, damping: 60 });
    const [blooms, setBlooms] = useState<{ id: number; x: number; y: number }[]>([]);
    const bloomCounter = useRef(0);

    const velX = useVelocity(springX);
    const velY = useVelocity(springY);

    useEffect(() => { if (!isDrawingEnabled) setBlooms([]); }, [isDrawingEnabled]);

    // Reset drawing state when switching tabs to prevent 3D brush from being carried over
    useEffect(() => {
        if (activeTab === 1) {
            setIsDrawingEnabled(false);
            setActiveColor(null);
        }
    }, [activeTab]);

    const brushBoxRefs = useMemo(() => [brushBoxMobileRef, brushBoxDesktopRef], []);
    const lastBloomPos = useRef({ x: 0, y: 0 });
    const updateMaskPosition = useCallback((x: number, y: number) => {
        maskX.set(x); 
        maskY.set(y);

        // Instant reveal trail: Spawn blooms based on distance moved
        const dist = Math.sqrt(Math.pow(x - lastBloomPos.current.x, 2) + Math.pow(y - lastBloomPos.current.y, 2));
        if (dist > 25) {
            setBlooms(prev => [...prev.slice(-300), { id: bloomCounter.current++, x, y }]);
            lastBloomPos.current = { x, y };
        }
    }, [maskX, maskY]);

    useEffect(() => {
        if (!isDrawingEnabled) {
            setBlooms([]);
            lastBloomPos.current = { x: 0, y: 0 };
            return;
        }
    }, [isDrawingEnabled]);

    const handlePanEnd = (_: any, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 60) {
            if (info.offset.x < 0 && activeTab === 0) setActiveTab(1);
            if (info.offset.x > 0 && activeTab === 1) setActiveTab(0);
        }
    };

    const theme = themeColors.find(t => t.id === activeThemeId) || themeColors[0];
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
    const watermarkX = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);
    const brushY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
    const leftTools = tools.filter(t => t.side === "left");
    const rightTools = tools.filter(t => t.side === "right");

    return (
        <>
        <motion.section ref={sectionRef} id="skills-section"
            className="relative bg-white py-20 md:py-40 px-4 md:px-12"
            style={{ transformStyle: "preserve-3d" }}>

            {/* Parallax watermark */}
            <motion.div style={{ x: watermarkX }} className="pointer-events-none absolute -top-8 -right-16 select-none" aria-hidden>
                <div className="font-syne text-[22vw] md:text-[18vw] font-black leading-none uppercase transition-colors duration-700"
                    style={{ color: `${theme.primary}05` }}>Index</div>
            </motion.div>

            <div className="relative z-20 pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
                <div className="container mx-auto max-w-7xl relative pointer-events-auto" style={{ transformStyle: "preserve-3d" }}>

                    {/* Header */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 md:mb-20 items-end">
                        <div className="lg:col-span-7 space-y-5">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white rotate-12 hover:rotate-0 transition-all duration-300"
                                    style={{ background: theme.primary }}>
                                    <Layers3 size={16} />
                                </div>
                                <span className="font-outfit text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] transition-colors duration-500"
                                    style={{ color: `${theme.primary}99` }}>Personal Index</span>
                            </motion.div>
                            <div className="overflow-hidden">
                                <h2 className="font-syne font-bold text-[#1A1F2B] leading-[0.9] tracking-tighter">
                                    <SplitReveal text="Tools, Taste," className="text-4xl md:text-7xl block" delay={0} />
                                    <span className="block overflow-hidden">
                                        <SplitReveal text="& Tempo." className="text-4xl md:text-7xl transition-colors duration-500" delay={0.18} />
                                    </span>
                                </h2>
                            </div>
                        </div>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                            className="lg:col-span-5 font-outfit text-sm md:text-lg text-[#1A1F2B]/50 leading-relaxed font-medium">
                            Every minor detail, character gesture, and color mood is treated as a deeply personal visual language.
                        </motion.p>
                    </div>

                    {/* Marquee */}
                    <div className="mb-10 md:mb-16">
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            className="font-outfit text-[9px] font-black uppercase tracking-widest text-[#1A1F2B]/25 mb-4 pb-4 border-b transition-colors duration-500"
                            style={{ borderColor: `${theme.primary}20` }}>Core Expertise</motion.div>
                        <SkillMarquee skills={allSkills} theme={theme} />
                    </div>

                    {/* Tab switcher */}
                    <div className="flex items-center justify-between mb-8 md:mb-12">
                        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
                        <div className="md:hidden flex items-center gap-1.5 text-[#1A1F2B]/25">
                            <ChevronRight size={12} />
                            <span className="font-outfit text-[8px] font-black uppercase tracking-widest">Swipe to switch</span>
                        </div>
                    </div>

                    {/* Tab content */}
                    <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1}
                        onPanEnd={handlePanEnd} style={{ touchAction: "pan-y" }}>
                        <AnimatePresence mode="wait">
                            {activeTab === 0 ? (
                                <motion.div key="tab-tools"
                                    initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>

                                    {/* MOBILE */}
                                    <div className="md:hidden flex flex-col gap-6 mb-16">
                                        <motion.div ref={brushBoxMobileRef} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }} transition={{ duration: 1 }}
                                            className={`relative w-full rounded-3xl border bg-gradient-to-b to-white/10 flex flex-col items-center justify-center`}
                                            style={{ height: 300, borderColor: `${theme.primary}25`, background: `linear-gradient(to bottom, ${theme.light}40, transparent)` }}>
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                <div className="w-36 h-36 rounded-full blur-3xl" style={{ background: `${theme.dot}20` }} />
                                            </div>
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-[70] pointer-events-auto">
                                                <button onClick={() => setIsDrawingEnabled(v => !v)}
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-md font-outfit text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
                                                    style={{ 
                                                        background: isDrawingEnabled ? theme.primary : "rgba(255,255,255,0.9)", 
                                                        borderColor: `${theme.primary}40`, 
                                                        color: isDrawingEnabled ? "white" : theme.primary,
                                                        boxShadow: isDrawingEnabled ? `0 10px 20px ${theme.primary}40` : "none"
                                                    }}>
                                                    {isDrawingEnabled ? <X size={14} /> : <Brush size={14} />}
                                                    {isDrawingEnabled ? "Stop Drawing" : "Start Drawing"}
                                                </button>
                                            </div>
                                        </motion.div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {tools.map((tool, i) => (
                                                <ToolIndicator key={tool.id} tool={tool} index={i} side={tool.side as "left" | "right"} onHover={setActiveColor} theme={theme} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* DESKTOP */}
                                    <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-center mb-24">
                                        <div className="flex flex-col gap-5 justify-center">
                                            {leftTools.map((tool, i) => <ToolIndicator key={tool.id} tool={tool} index={i} side="left" onHover={setActiveColor} theme={theme} />)}
                                        </div>

                                        <motion.div style={{ y: brushY }} className="relative flex items-center justify-center">
                                            <motion.div ref={brushBoxDesktopRef} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }} transition={{ duration: 1.2 }}
                                                className={`relative rounded-[2.5rem] border transition-colors duration-500`}
                                                style={{ width: 240, height: 520, borderColor: `${theme.primary}25`, background: `linear-gradient(180deg, ${theme.light}40, transparent)` }}>
                                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                    <div className="w-40 h-40 rounded-full blur-3xl" style={{ background: `${theme.dot}18` }} />
                                                </div>
                                                {[["top-4 left-4", "border-t border-l"], ["top-4 right-4", "border-t border-r"], ["bottom-4 left-4", "border-b border-l"], ["bottom-4 right-4", "border-b border-r"]].map(([pos, b], k) => (
                                                    <div key={k} className={`absolute w-3 h-3 pointer-events-none opacity-40 ${pos} ${b}`} style={{ borderColor: theme.primary }} />
                                                ))}
                                                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[70] pointer-events-auto">
                                                    <button onClick={() => setIsDrawingEnabled(v => !v)}
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border font-outfit text-[8px] font-black uppercase tracking-widest transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
                                                        style={{ 
                                                            background: isDrawingEnabled ? theme.primary : "rgba(255,255,255,0.85)", 
                                                            borderColor: `${theme.primary}40`, 
                                                            color: isDrawingEnabled ? "white" : theme.primary,
                                                            boxShadow: isDrawingEnabled ? `0 15px 30px ${theme.primary}30` : "none"
                                                        }}>
                                                        {isDrawingEnabled ? <Edit3 size={12} className="rotate-90" /> : <Brush size={12} />}
                                                        {isDrawingEnabled ? "Stop Drawing" : "Start Drawing"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                                                <div className="h-6 w-px" style={{ background: `${theme.primary}40` }} />
                                                <span className="font-outfit text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: `${theme.primary}60` }}>Standard Kit</span>
                                            </div>
                                        </motion.div>

                                        <div className="flex flex-col gap-5 justify-center">
                                            {rightTools.map((tool, i) => <ToolIndicator key={tool.id} tool={tool} index={i} side="right" onHover={setActiveColor} theme={theme} />)}
                                        </div>
                                    </div>

                                    <MethodologyGrid theme={theme} />
                                </motion.div>
                            ) : (
                                <motion.div key="tab-palette"
                                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
                                    <PaletteTab activeThemeId={activeThemeId} onThemeChange={(id) => { if (onThemeChange) onThemeChange(id); }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} aria-hidden="true">
                <defs>
                    <filter id="ink-spread-ultimate" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="1" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" />
                    </filter>
                    <mask id="ink-mask-skills-ultimate" maskUnits="userSpaceOnUse">
                        <rect width="100%" height="100%" fill="black" />
                        <g filter="url(#ink-spread-ultimate)">
                            {/* Primary ellipse for instant feedback */}
                            <motion.ellipse cx={springX} cy={springY} rx="180" ry="120" fill="white" />
                            <AnimatePresence>
                                {blooms.filter(b => !isNaN(b.x) && !isNaN(b.y)).map(bloom => (
                                    <motion.ellipse key={bloom.id}
                                        cx={bloom.x} cy={bloom.y}
                                        initial={{ rx: 20, ry: 10, opacity: 0 }}
                                        animate={{ rx: [20, 300, 450], ry: [10, 180, 280], opacity: [0, 1, 1] }}
                                        transition={{ duration: 3.5, times: [0, 0.1, 1], ease: "easeOut" }} fill="white" />
                                ))}
                            </AnimatePresence>
                        </g>
                    </mask>
                </defs>
            </svg>

            {/* Ink reveal layer - Positioned at z-10 to be behind UI components (z-20) but above base background */}
            {isDrawingEnabled && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
                    style={{ 
                        maskImage: "url(#ink-mask-skills-ultimate)", 
                        WebkitMaskImage: "url(#ink-mask-skills-ultimate)",
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%"
                    }}>
                    <div className="absolute inset-0 bg-[#0a0a0a]">
                        <Image src="/backgroundskillsection.webp" alt="Revealed Skills Background" fill className="object-cover" priority unoptimized />
                    </div>
                </div>
            )}
        </motion.section>
            {/* 3D Brush Canvas - Rendered as a sibling to avoid container constraints while maintaining clean context */}
            <BrushCanvas 
                activeColor={activeColor} 
                homeBoxRefs={brushBoxRefs} 
                sectionRef={sectionRef}
                onPositionUpdate={isDrawingEnabled ? updateMaskPosition : undefined}
                onDraggingStateChange={useCallback(() => { }, [])} 
                isDrawingEnabled={isDrawingEnabled} 
                theme={theme}
                activeTab={activeTab}
            />
        </>
    );
}

export default SkillsSection;
