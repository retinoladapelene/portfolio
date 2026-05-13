"use client";

import { Suspense, useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { 
    PerspectiveCamera, 
    Environment, 
    Text, 
    Float,
    Loader,
    KeyboardControls,
    useKeyboardControls,
    SpotLight,
    PointerLockControls,
    Html,
    AdaptiveDpr,
    AdaptiveEvents,
    Preload,
    BakeShadows,
    Instances,
    Instance,
    Detailed,
    Stars,
    useTexture,
    Billboard
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Maximize, Minimize, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Configuration ---
const ROOM_RADIUS = 12;
const ART_Y = 4.5;

// --- Sub-Component: Art on Pedestal ---
function PedestalArt({ quality, isSurpriseActive, setIsSurpriseActive }: any) {
    // Use useTexture for more robust loading
    const texture = useTexture("/zarrylinilo.png");
    
    useLayoutEffect(() => {
        if (texture) {
            texture.anisotropy = 16;
            texture.needsUpdate = true;
        }
    }, [texture]);
    
    return (
        <group position={[0, 1.15, 0]}>
            {/* Glass Case (Cylindrical as requested) - Optimized Segments */}
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.9, 0.9, 1.2, quality === 'low' ? 12 : 24]} />
                <meshStandardMaterial 
                    transparent 
                    opacity={0.2} 
                    roughness={0} 
                    metalness={0.5}
                    color="#eef"
                    side={THREE.DoubleSide}
                />
            </mesh>
            
            {/* Inner Frame */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.55, 0.75, 0.05]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
            </mesh>
            
            {/* Photo */}
            <mesh position={[0, 0.6, 0.03]}>
                <planeGeometry args={[0.5, 0.7]} />
                <meshStandardMaterial 
                    map={texture} 
                    color="#fff" 
                />
            </mesh>

            {/* Info Papan (Info Board) - Moved out and down to avoid clashing */}
            <group position={[0, -0.15, 1.0]} rotation={[-0.6, 0, 0]}>
                <mesh>
                    <planeGeometry args={[0.7, 0.35]} />
                    <meshStandardMaterial color="#1a0000" />
                </mesh>
                {/* Gold border for board */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[0.72, 0.37]} />
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                </mesh>
                
                <group position={[0, 0.05, 0.02]}>
                    <Text
                        fontSize={0.04}
                        color="#D4AF37"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.002}
                        outlineColor="#000000"
                    >
                        ZarryLinilo X Mamystaa
                    </Text>
                </group>

                {/* Surprise Me Button */}
                <group 
                    position={[0, -0.08, 0.02]} 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSurpriseActive(!isSurpriseActive);
                    }}
                >
                    <mesh onPointerOver={(e) => (document.body.style.cursor = 'pointer')} onPointerOut={(e) => (document.body.style.cursor = 'crosshair')}>
                        <planeGeometry args={[0.3, 0.1]} />
                        <meshStandardMaterial 
                            color={isSurpriseActive ? "#D4AF37" : "#300040"} 
                            emissive={isSurpriseActive ? "#D4AF37" : "#500080"}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                    <Text
                        position={[0, 0, 0.01]}
                        fontSize={0.025}
                        color={isSurpriseActive ? "#000" : "#fff"}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {isSurpriseActive ? "SURPRISE ON" : "SURPRISE ME"}
                    </Text>
                </group>
            </group>
        </group>
    );
}

// --- Sub-Component: Shooting Star (Every 1s, Left-to-Right POV) ---
function ShootingStar() {
    const starRef = useRef<THREE.Group>(null!);
    const [active, setActive] = useState(false);
    const progress = useRef(0);
    const startPos = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const lastTrigger = useRef(0);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const camera = state.camera;
        
        // Trigger every 10 seconds
        if (time - lastTrigger.current > 10) {
            lastTrigger.current = time;
            progress.current = 0;
            setActive(true);
            
            // Calculate screen-relative directions
            const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
            const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
            const forward = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).negate();

            // Randomize height and distance in view
            const heightOffset = 15 + Math.random() * 20;
            const distance = 80 + Math.random() * 20;
            const horizontalSpan = 60;

            // Start position: Left of camera gaze
            startPos.current.copy(camera.position)
                .add(forward.clone().multiplyScalar(distance))
                .add(up.clone().multiplyScalar(heightOffset))
                .add(right.clone().multiplyScalar(-horizontalSpan));
            
            // Direction: Purely towards the right vector
            direction.current.copy(right).multiplyScalar(horizontalSpan * 2);
        }

        if (active && starRef.current) {
            progress.current += 0.04; // Faster movement
            
            if (progress.current > 1) {
                setActive(false);
            } else {
                const currentPos = startPos.current.clone().add(direction.current.clone().multiplyScalar(progress.current));
                starRef.current.position.copy(currentPos);
                
                // Tail orientation: should point opposite to movement
                starRef.current.lookAt(currentPos.clone().add(direction.current));
                
                // Fade out
                starRef.current.scale.setScalar(Math.max(0, 1 - progress.current * 0.5));
            }
        }
    });

    if (!active) return null;

    return (
        <group ref={starRef}>
            {/* Bright Head */}
            <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            {/* Long Light Trail - Oriented to movement */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
                <cylinderGeometry args={[0.01, 0.2, 6, 8]} />
                <meshBasicMaterial color="#fff" transparent opacity={0.6} />
            </mesh>
            <pointLight intensity={5} distance={15} color="#fff" />
        </group>
    );
}

// --- Sub-Component: Night Clouds (Ultra-Realistic Wispy & Torn) ---
function NightClouds() {
    const texture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, 1024, 1024);
        
        // Pass 1: Additive - Build core cloud mass
        for (let i = 0; i < 200; i++) {
            const x = 512 + (Math.random() - 0.5) * 600;
            const y = 512 + (Math.random() - 0.5) * 400;
            const radius = 20 + Math.random() * 120;
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            const alpha = 0.02 + Math.random() * 0.08;
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pass 2: Subtractive - "Carve" out the cloud to get torn/fragmented edges
        ctx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 100; i++) {
            const x = 512 + (Math.random() - 0.5) * 800;
            const y = 512 + (Math.random() - 0.5) * 600;
            const radius = 10 + Math.random() * 60;
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

    const cloudClusters = useMemo(() => {
        // Create 18 clusters for a dense, realistic sky
        return Array.from({ length: 18 }).map((_, i) => ({
            id: i,
            basePos: new THREE.Vector3(
                Math.random() * 400 - 200,
                35 + Math.random() * 45,
                Math.random() * 400 - 200
            ),
            speed: 0.02 + Math.random() * 0.05,
            // 8 fragments per cluster for maximum "torn" detail
            fragments: Array.from({ length: 8 }).map((_, j) => ({
                offset: [Math.random() * 15 - 7.5, Math.random() * 10 - 5, Math.random() * 15 - 7.5],
                scale: [30 + Math.random() * 50, 15 + Math.random() * 25, 1] as [number, number, number],
                rotation: Math.random() * Math.PI,
                opacity: 0.15 + Math.random() * 0.3
            }))
        }));
    }, []);

    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.children.forEach((cluster, i) => {
            cluster.position.x += cloudClusters[i].speed;
            if (cluster.position.x > 200) cluster.position.x = -200;
        });
    });

    if (!texture) return null;

    return (
        <group ref={groupRef}>
            {cloudClusters.map((cluster) => (
                <group key={cluster.id} position={cluster.basePos}>
                    {cluster.fragments.map((frag, j) => (
                        <Billboard key={j} position={frag.offset as any} scale={frag.scale}>
                            <mesh rotation={[0, 0, frag.rotation]}>
                                <planeGeometry />
                                <meshBasicMaterial 
                                    map={texture} 
                                    transparent 
                                    opacity={frag.opacity} 
                                    color="#777799" 
                                    depthWrite={false}
                                    blending={THREE.NormalBlending}
                                />
                            </mesh>
                        </Billboard>
                    ))}
                </group>
            ))}
        </group>
    );
}

// --- Sub-Component: Perfect Crescent Moon (from reference) ---
function CrescentMoon() {
    const moonShape = useMemo(() => {
        const shape = new THREE.Shape();
        const radius = 5;
        // The d value controls the 'thickness' of the crescent
        const d = 2.2; 
        const innerRadius = Math.sqrt(d * d + radius * radius);
        const startAngle = Math.PI - Math.asin(radius / innerRadius);
        const endAngle = Math.PI + Math.asin(radius / innerRadius);

        // Outer arc (Half circle)
        shape.absarc(0, 0, radius, -Math.PI / 2, Math.PI / 2, false);
        // Inner arc (Circular subtraction to create perfect crescent)
        shape.absarc(d, 0, innerRadius, startAngle, endAngle, true);
        
        return shape;
    }, []);

    return (
        <Billboard follow={true}>
            <group rotation={[0, 0, 0.6]} scale={1.8}>
                {/* Main Moon Body with Emissive Glow */}
                <mesh>
                    <shapeGeometry args={[moonShape]} />
                    <meshStandardMaterial 
                        color="#fffbe6" 
                        emissive="#fffbe6" 
                        emissiveIntensity={1.2}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                
                {/* Atmospheric Moon Halo (Soft Glow) */}
                <mesh scale={1.15}>
                    <shapeGeometry args={[moonShape]} />
                    <meshBasicMaterial 
                        color="#fffbe6" 
                        transparent 
                        opacity={0.15} 
                        side={THREE.DoubleSide}
                    />
                </mesh>
                <mesh scale={1.3}>
                    <shapeGeometry args={[moonShape]} />
                    <meshBasicMaterial 
                        color="#fffbe6" 
                        transparent 
                        opacity={0.08} 
                        side={THREE.DoubleSide}
                    />
                </mesh>
                
                <pointLight intensity={5} distance={50} color="#fffbe6" />
            </group>
        </Billboard>
    );
}

// --- Sub-Component: Custom Starfield (Guaranteed Visibility) ---
function Starfield({ count = 5000, radius = 100 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = radius + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
        }
        return p;
    }, [count, radius]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="#ffffff" transparent opacity={0.8} sizeAttenuation={true} />
        </points>
    );
}

// --- Sub-Component: Grand Ornate Chandelier ---
function Chandelier({ quality }: { quality: string }) {
    // Ceiling is at Y=10. Chandelier is at Y=7.5. Gap is 2.5.
    // Each link is 0.15 apart. 2.5 / 0.15 = ~17 links.
    const chainLinks = Array.from({ length: 17 }, (_, i) => i * 0.15);

    return (
        <group position={[0, 7.5, 0]}>
            {/* 1. Hanging Chain (Reaching all the way to the 10m ceiling) */}
            {chainLinks.map((y) => (
                <mesh key={y} position={[0, y, 0]} rotation={[0, (y / 0.15) % 2 === 0 ? 0 : Math.PI / 2, 0]}>
                    <torusGeometry args={[0.03, 0.008, 8, 16]} />
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                </mesh>
            ))}

            {/* 2. Ornate Central Pillar (Full Gold) */}
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.06, 0.1, 0.5, 16]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>
            {/* Golden Middle Ring Detail */}
            <mesh position={[0, -0.3, 0]}>
                <torusGeometry args={[0.12, 0.025, 12, 24]} />
                <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
            </mesh>

            {/* 3. Curved S-Arms (6 arms - Full Gold) */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
                <group key={angle} rotation={[0, (angle * Math.PI) / 180, 0]}>
                    {/* The S-Curve Arm */}
                    <mesh position={[0.25, -0.35, 0]} rotation={[0, 0, -Math.PI / 6]}>
                        <torusGeometry args={[0.2, 0.022, 8, 32, Math.PI]} />
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                    </mesh>
                    <mesh position={[0.42, -0.22, 0]} rotation={[0, 0, Math.PI / 1.2]}>
                        <torusGeometry args={[0.15, 0.022, 8, 32, Math.PI]} />
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                    </mesh>
                    
                    {/* Golden accent at arm base */}
                    <mesh position={[0.08, -0.38, 0]}>
                        <sphereGeometry args={[0.045, 8, 8]} />
                        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
                    </mesh>

                    {/* 4. Lampshade and Light Source */}
                    <group position={[0.55, -0.12, 0]}>
                        {/* Fabric Shade with Golden Glow */}
                        <mesh>
                            <cylinderGeometry args={[0.07, 0.1, 0.18, 16, 1, true]} />
                            <meshStandardMaterial 
                                color="#fffaf0" 
                                emissive="#FFD700" 
                                emissiveIntensity={0.2} 
                                transparent 
                                opacity={0.9} 
                                side={THREE.DoubleSide} 
                            />
                        </mesh>
                        {/* Gold Trim (Top & Bottom) */}
                        <mesh position={[0, 0.09, 0]}>
                            <torusGeometry args={[0.07, 0.008, 8, 24]} />
                            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
                        </mesh>
                        <mesh position={[0, -0.09, 0]}>
                            <torusGeometry args={[0.1, 0.008, 8, 24]} />
                            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
                        </mesh>
                        
                        {/* Warm Light Source */}
                        <pointLight 
                            intensity={quality === 'low' ? 0.4 : 0.8} 
                            distance={8} 
                            color="#fff0d0" 
                            position={[0, 0, 0]} 
                            castShadow={quality === 'high'}
                        />
                    </group>
                </group>
            ))}

            {/* Bottom Golden Ornament */}
            <mesh position={[0, -0.45, 0]}>
                <cylinderGeometry args={[0.12, 0.05, 0.1, 16]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.52, 0]}>
                <sphereGeometry args={[0.05, 12, 12]} />
                <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
            </mesh>
        </group>
    );
}

// --- Sub-Component: Luxury Parquet Floor ---
function ParquetFloor({ quality }: { quality: string }) {
    const texture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Base Dark Wood Color
        ctx.fillStyle = '#1a120b';
        ctx.fillRect(0, 0, 1024, 1024);

        const plankW = 128;
        const plankH = 32;

        // Draw Herringbone Pattern
        for (let i = -10; i < 20; i++) {
            for (let j = -10; j < 20; j++) {
                ctx.save();
                ctx.translate(i * 64, j * 64);
                
                // Draw two planks in a "V" shape
                const drawPlank = (rot: number, tx: number, ty: number, shade: number) => {
                    ctx.save();
                    ctx.translate(tx, ty);
                    ctx.rotate(rot);
                    
                    // Variation in wood color
                    const r = 26 + shade;
                    const g = 18 + shade;
                    const b = 11 + shade;
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(0, 0, plankW, plankH);
                    
                    // Grain lines
                    ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
                    for(let k = 0; k < 5; k++) {
                        ctx.beginPath();
                        const gy = Math.random() * plankH;
                        ctx.moveTo(0, gy);
                        ctx.lineTo(plankW, gy + (Math.random() - 0.5) * 5);
                        ctx.stroke();
                    }
                    
                    // Bevel/Border
                    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(0, 0, plankW, plankH);
                    
                    ctx.restore();
                };

                const s1 = Math.random() * 10;
                const s2 = Math.random() * 10;
                drawPlank(Math.PI / 4, 0, 0, s1);
                drawPlank(-Math.PI / 4, 45, -45, s2);
                
                ctx.restore();
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4); // Tile the pattern
        return tex;
    }, []);

    return (
        <meshStandardMaterial 
            map={texture || undefined} 
            roughness={0.7} 
            metalness={0.1} 
            color="#ffffff"
        />
    );
}

// --- Sub-Component: Virtual Joystick for Mobile ---
function VirtualJoystick({ onMove, onEnd }: { onMove: (data: { x: number; y: number }) => void, onEnd: () => void }) {
    return (
        <div className="fixed bottom-12 left-12 z-[100]">
            <div className="relative w-32 h-32 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                <motion.div
                    drag
                    dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    dragElastic={1}
                    onDrag={(_, info) => {
                        // Max distance is roughly 60px
                        const x = Math.max(-1, Math.min(1, info.offset.x / 50));
                        const y = Math.max(-1, Math.min(1, info.offset.y / 50));
                        onMove({ x, y: -y });
                    }}
                    onDragEnd={onEnd}
                    className="w-14 h-14 rounded-full bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer z-10"
                />
                <div className="absolute inset-0 rounded-full border-2 border-white/5 pointer-events-none" />
            </div>
        </div>
    );
}

// --- Sub-Component: Art Frame (Classic Style) ---
function ArtFrame({ url, title, position, rotation, onSelect, quality, description, isSurpriseActive }: any) {
    // Use useLoader for robust texture management and caching
    const texture = useLoader(THREE.TextureLoader, url) as THREE.Texture;
    const [failed, setFailed] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (texture) {
            texture.minFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.needsUpdate = true;
        }
    }, [texture]);

    return (
        <group position={position} rotation={rotation}>
            {/* LED Track Light Head (Ceiling Mounted) - Fades out in surprise mode */}
            {!isSurpriseActive && (
                <group position={[0, 6.5, 2]}>
                    {/* Connection to track */}
                    <mesh position={[0, 0.2, 0]}>
                        <boxGeometry args={[0.05, 0.2, 0.05]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    
                    {/* Light Body tilted precisely towards artwork */}
                    <group rotation={[0.3, 0, 0]}>
                        <mesh>
                            <cylinderGeometry args={[0.08, 0.08, 0.25, 12]} />
                            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                        </mesh>
                        
                        {/* Visual Lamp Fixture - Only the mesh, no active light for performance */}
                        <mesh position={[0, -0.05, 0]}>
                            <cylinderGeometry args={[0.08, 0.12, 0.15, 12]} />
                            <meshBasicMaterial color={hovered ? "#FFD700" : "#333"} />
                        </mesh>
                    </group>
                </group>
            )}

            {/* LOD SYSTEM for Artwork - Disabled for HIGH quality to maintain maximum fidelity at any distance */}
            {quality === 'high' ? (
                <group>
                    {/* Ornate Frame Border */}
                    <mesh 
                        onPointerOver={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                        onClick={() => onSelect({ url, title, description })}
                    >
                        <boxGeometry args={[2.4, 3.4, 0.1]} />
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                    </mesh>

                    {/* Inner Border / Bevel */}
                    <mesh position={[0, 0, 0.05]}>
                        <boxGeometry args={[2.2, 3.2, 0.05]} />
                        <meshStandardMaterial color="#8B6508" metalness={1} roughness={0.1} />
                    </mesh>

                    {/* Artwork Image */}
                    <mesh position={[0, 0, 0.1]} onClick={() => onSelect({ url, title, description })}>
                        <planeGeometry args={[2, 3]} />
                        <meshStandardMaterial 
                            map={texture} 
                            color={failed ? "#1a1a1a" : "#fff"}
                            transparent={false} 
                        />
                        {failed && (
                            <Text
                                position={[0, 0, 0.01]}
                                fontSize={0.1}
                                color="#444"
                                textAlign="center"
                                maxWidth={1.8}
                            >
                                IMAGE UNAVAILABLE
                            </Text>
                        )}
                    </mesh>

                    {/* Label Below */}
                    <Text
                        position={[0, -2.2, 0.1]}
                        fontSize={0.15}
                        color="#D4AF37"
                        fillOpacity={hovered ? 1 : 0.6}
                    >
                        {title.toUpperCase()}
                    </Text>
                </group>
            ) : (
                <Detailed distances={[0, 10, 18]}>
                    {/* HIGH LOD (0-10m): Full Detail with Ornate Frames and Labels */}
                    <group>
                        {/* Ornate Frame Border */}
                        <mesh 
                            onPointerOver={() => setHovered(true)}
                            onPointerOut={() => setHovered(false)}
                            onClick={() => onSelect({ url, title, description })}
                        >
                            <boxGeometry args={[2.4, 3.4, 0.1]} />
                            <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                        </mesh>

                        {/* Inner Border / Bevel */}
                        <mesh position={[0, 0, 0.05]}>
                            <boxGeometry args={[2.2, 3.2, 0.05]} />
                            <meshStandardMaterial color="#8B6508" metalness={1} roughness={0.1} />
                        </mesh>

                        {/* Artwork Image */}
                        <mesh position={[0, 0, 0.1]} onClick={() => onSelect({ url, title, description })}>
                            <planeGeometry args={[2, 3]} />
                            <meshStandardMaterial 
                                map={texture} 
                                color={failed ? "#1a1a1a" : "#fff"}
                                transparent={false} 
                            />
                            {failed && (
                                <Text
                                    position={[0, 0, 0.01]}
                                    fontSize={0.1}
                                    color="#444"
                                    textAlign="center"
                                    maxWidth={1.8}
                                >
                                    IMAGE UNAVAILABLE
                                </Text>
                            )}
                        </mesh>

                        {/* Label Below */}
                        <Text
                            position={[0, -2.2, 0.1]}
                            fontSize={0.15}
                            color="#D4AF37"
                            fillOpacity={hovered ? 1 : 0.6}
                        >
                            {title.toUpperCase()}
                        </Text>
                    </group>

                    {/* MEDIUM LOD (10-18m): Simplified Frame, No Labels, No Inner Border */}
                    <group>
                        <mesh onClick={() => onSelect({ url, title, description })}>
                            <boxGeometry args={[2.4, 3.4, 0.05]} />
                            <meshStandardMaterial color="#D4AF37" metalness={0.5} roughness={0.5} />
                        </mesh>
                        <mesh position={[0, 0, 0.03]} onClick={() => onSelect({ url, title, description })}>
                            <planeGeometry args={[2, 3]} />
                            <meshStandardMaterial map={texture} color={failed ? "#1a1a1a" : "#fff"} />
                        </mesh>
                    </group>

                    {/* LOW LOD (18m+): Just a flat billboard before culling */}
                    <mesh onClick={() => onSelect({ url, title, description })}>
                        <planeGeometry args={[2.4, 3.4]} />
                        <meshStandardMaterial color="#1a0000" />
                    </mesh>
                </Detailed>
            )}
        </group>
    );
}

// --- Sub-Component: Player Controls (Hybrid: WASD + Joystick) ---
function Player({ joystickData }: { joystickData: { x: number; y: number } | null }) {
    const [, get] = useKeyboardControls();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const forwardVector = useRef(new THREE.Vector3());
    const rightVector = useRef(new THREE.Vector3());
    
    // Custom Touch Look for Mobile
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    const lastTouch = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined' || window.innerWidth >= 768) return;

        const handleTouchStart = (e: TouchEvent) => {
            lastTouch.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            
            // Double Tap Detection for Immersion Mode
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            if (now - (window as any)._lastTap < DOUBLE_TAP_DELAY) {
                // Toggle immersion mode on parent (we'll need to pass this down or use an event)
                window.dispatchEvent(new CustomEvent('toggle-immersion'));
            }
            (window as any)._lastTap = now;
        };

        const handleTouchMove = (e: TouchEvent) => {
            // Only rotate if touching the right side of the screen or upper part (not on joystick)
            if (e.touches[0].pageX < window.innerWidth / 3 && e.touches[0].pageY > window.innerHeight / 2) return;

            const movementX = e.touches[0].pageX - lastTouch.current.x;
            const movementY = e.touches[0].pageY - lastTouch.current.y;
            
            euler.current.y -= movementX * 0.005;
            euler.current.x -= movementY * 0.005;
            euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
            
            lastTouch.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    useFrame((state) => {
        const { forward, backward, left, right } = get();
        
        // Sync camera rotation from touch on mobile
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            state.camera.quaternion.setFromEuler(euler.current);
        } else {
            // Keep euler in sync with pointer lock controls for hybrid consistency
            euler.current.setFromQuaternion(state.camera.quaternion);
        }

        // Use pre-allocated vectors
        forwardVector.current.set(0, 0, -1).applyQuaternion(state.camera.quaternion);
        rightVector.current.set(1, 0, 0).applyQuaternion(state.camera.quaternion);
        
        forwardVector.current.y = 0;
        rightVector.current.y = 0;
        forwardVector.current.normalize();
        rightVector.current.normalize();

        direction.current.set(0, 0, 0);

        if (forward) direction.current.add(forwardVector.current);
        if (backward) direction.current.sub(forwardVector.current);
        if (left) direction.current.sub(rightVector.current);
        if (right) direction.current.add(rightVector.current);

        if (joystickData) {
            const joyForward = forwardVector.current.clone().multiplyScalar(joystickData.y);
            const joyRight = rightVector.current.clone().multiplyScalar(joystickData.x);
            direction.current.add(joyForward).add(joyRight);
        }
        
        direction.current.normalize();

        const speed = 0.12;
        if (forward || backward || left || right || (joystickData && (Math.abs(joystickData.x) > 0.1 || Math.abs(joystickData.y) > 0.1))) {
            velocity.current.lerp(direction.current.multiplyScalar(speed), 0.1);
        } else {
            velocity.current.multiplyScalar(0.9);
        }

        state.camera.position.add(velocity.current);

        // Circular Collision
        const distFromCenter = Math.sqrt(state.camera.position.x ** 2 + state.camera.position.z ** 2);
        if (distFromCenter > ROOM_RADIUS - 3) {
            const ratio = (ROOM_RADIUS - 3) / distFromCenter;
            state.camera.position.x *= ratio;
            state.camera.position.z *= ratio;
        }

        // Head bob
        if (forward || backward || left || right || (joystickData && (Math.abs(joystickData.x) > 0.1 || Math.abs(joystickData.y) > 0.1))) {
            state.camera.position.y = 1.7 + Math.sin(state.clock.elapsedTime * 6) * 0.01;
        } else {
            state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.7, 0.1);
        }
    });

    return null;
}



// --- Sub-Component: Gallery Scene ---
function GalleryScene({ onSelectArt, artworks, quality, isSurpriseActive, setIsSurpriseActive }: any) {
    const ambientIntensity = isSurpriseActive ? 0.2 : (quality === 'low' ? 1.8 : 1.4);
    
    return (
        <>
            <ambientLight intensity={ambientIntensity} />
            
            {/* Luxury Dark Herringbone Wood Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <circleGeometry args={[ROOM_RADIUS, 64]} />
                <ParquetFloor quality={quality} />
            </mesh>

            {/* Circular Museum Wall (Deep Red) */}
            <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[ROOM_RADIUS, ROOM_RADIUS, 12, quality === 'low' ? 32 : 64, 1, true]} />
                <meshStandardMaterial color="#2d0000" side={THREE.BackSide} roughness={0.8} />
            </mesh>

            {/* Architectural Details: Lower Wainscoting (Dado Rail) */}
            <mesh position={[0, 0.75, 0]}>
                <cylinderGeometry args={[ROOM_RADIUS - 0.1, ROOM_RADIUS - 0.1, 1.5, quality === 'low' ? 32 : 64, 1, true]} />
                <meshStandardMaterial color="#1a0000" side={THREE.BackSide} />
            </mesh>
            {/* Gold Trim for Wainscoting */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[ROOM_RADIUS - 0.15, ROOM_RADIUS - 0.15, 0.05, quality === 'low' ? 32 : 64, 1, true]} />
                <meshStandardMaterial color="#D4AF37" side={THREE.BackSide} metalness={1} roughness={0.2} />
            </mesh>

            {/* Architectural Details: Upper Crown Molding */}
            <mesh position={[0, 9.25, 0]}>
                <cylinderGeometry args={[ROOM_RADIUS - 0.1, ROOM_RADIUS - 0.1, 1.5, quality === 'low' ? 32 : 64, 1, true]} />
                <meshStandardMaterial color="#1a0000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, 8.5, 0]}>
                <cylinderGeometry args={[ROOM_RADIUS - 0.15, ROOM_RADIUS - 0.15, 0.05, quality === 'low' ? 32 : 64, 1, true]} />
                <meshStandardMaterial color="#D4AF37" side={THREE.BackSide} metalness={1} roughness={0.2} />
            </mesh>

            {/* Optimized Instanced Decorative Pillars */}
            <Instances range={artworks.length}>
                <cylinderGeometry args={[0.3, 0.3, 7, 16]} />
                <meshStandardMaterial color="#1a0000" metalness={0.5} roughness={0.5} />
                {artworks.map((_: any, i: number) => {
                    const angle = ((i + 0.5) / artworks.length) * Math.PI * 2;
                    const x = Math.cos(angle) * (ROOM_RADIUS - 0.2);
                    const z = Math.sin(angle) * (ROOM_RADIUS - 0.2);
                    return (
                        <Instance 
                            key={`pillar-${i}`} 
                            position={[x, 5, z]} 
                            rotation={[0, -angle + Math.PI / 2, 0]} 
                        />
                    );
                })}
            </Instances>

            {/* Optimized Gold Column Caps (Top) */}
            <Instances range={artworks.length}>
                <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                {artworks.map((_: any, i: number) => {
                    const angle = ((i + 0.5) / artworks.length) * Math.PI * 2;
                    const x = Math.cos(angle) * (ROOM_RADIUS - 0.2);
                    const z = Math.sin(angle) * (ROOM_RADIUS - 0.2);
                    return (
                        <group key={`caps-${i}`}>
                            <Instance position={[x, 8.5, z]} rotation={[0, -angle + Math.PI / 2, 0]} />
                            <Instance position={[x, 1.5, z]} rotation={[0, -angle + Math.PI / 2, 0]} />
                        </group>
                    );
                })}
            </Instances>

            {/* --- CENTRAL PEDESTAL --- */}
            <group position={[0, 0, 0]}>
                {/* Main Base */}
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.8, 0.9, 0.3, 32]} />
                    <meshStandardMaterial color="#1a0000" />
                </mesh>
                {/* Gold Base Trim */}
                <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.95, 0.95, 0.05, 32]} />
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                </mesh>

                {/* Column */}
                <mesh position={[0, 0.65, 0]}>
                    <cylinderGeometry args={[0.6, 0.7, 0.7, 32]} />
                    <meshStandardMaterial color="#2d0000" />
                </mesh>

                {/* Top Platform */}
                <mesh position={[0, 1.05, 0]}>
                    <cylinderGeometry args={[0.85, 0.8, 0.1, 32]} />
                    <meshStandardMaterial color="#1a0000" />
                </mesh>
                {/* Gold Top Trim */}
                <mesh position={[0, 1.1, 0]}>
                    <cylinderGeometry args={[0.9, 0.9, 0.03, 32]} />
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                </mesh>
                
                {/* The Artwork on top of Pedestal */}
                <PedestalArt 
                    quality={quality} 
                    isSurpriseActive={isSurpriseActive} 
                    setIsSurpriseActive={setIsSurpriseActive} 
                />

                {/* Luxury Chandelier directly above - Hide in surprise mode */}
                {!isSurpriseActive && <Chandelier quality={quality} />}

                {/* Precise Sharper Spotlight for the Pedestal Focal Point - Stays visible to highlight the art */}
                {quality !== 'low' && (
                    <SpotLight 
                        position={[0, 9, 0]}
                        angle={0.3}
                        penumbra={0.2}
                        intensity={isSurpriseActive ? (quality === 'high' ? 600 : 300) : (quality === 'high' ? 1500 : 800)}
                        color="#FFD700" // Always Golden Yellow as requested
                        target-position={[0, 1.5, 0]}
                        distance={12}
                        attenuation={15}
                        anglePower={12}
                        opacity={quality === 'high' ? 0.3 : 0.1}
                        castShadow={quality === 'high'}
                    />
                )}
            </group>

            {/* Ceiling with Central Skylight and Track Rail */}
            <group position={[0, 10, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} visible={!isSurpriseActive}>
                    <circleGeometry args={[ROOM_RADIUS, 64]} />
                    <meshStandardMaterial 
                        color="#0a0a0a" 
                        side={THREE.DoubleSide} 
                    />
                </mesh>

                {/* Stars and Moon reveal when Surprise is Active */}
                {isSurpriseActive && (
                    <group>
                        {/* Night Sky Background (Outer Shell) */}
                        <mesh position={[0, 0, 0]}>
                            <sphereGeometry args={[150, 32, 32]} />
                            <meshBasicMaterial color="#000005" side={THREE.BackSide} />
                        </mesh>
                        
                        {/* Custom Guaranteed Stars */}
                        <Starfield count={quality === 'high' ? 8000 : 3000} radius={110} />

                        {/* Animated Shooting Star */}
                        <ShootingStar />

                        {/* Drifting Night Clouds */}
                        <NightClouds />

                        {/* Perfect Crescent Moon (Reference-matched) */}
                        <group position={[50, 75, -60]}>
                            <CrescentMoon />
                        </group>

                        {/* Fog/Atmospheric Glow */}
                        <fog attach="fog" args={["#000010", 1, 100]} />
                    </group>
                )}

                {/* Circular Track Rail for LED Lights */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} visible={!isSurpriseActive}>
                    <torusGeometry args={[ROOM_RADIUS - 2.5, 0.04, 16, 64]} />
                    <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Skylight Glow - Fades out completely in surprise mode */}
                {!isSurpriseActive && (
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <circleGeometry args={[ROOM_RADIUS * 0.35, 32]} />
                        <meshBasicMaterial 
                            color="#fff" 
                            transparent 
                            opacity={0.5} 
                        />
                    </mesh>
                )}
                <directionalLight position={[0, -1, 0]} intensity={isSurpriseActive ? 0.1 : 1.5} color="#fff" />
            </group>

            {/* Artworks arranged in a circle facing the center */}
            {artworks
                .filter((art: any) => art.image_url && art.image_url !== "undefined")
                .map((art: any, i: number) => {
                    const angle = (i / artworks.length) * Math.PI * 2;
                    const x = Math.cos(angle) * (ROOM_RADIUS - 0.5);
                    const z = Math.sin(angle) * (ROOM_RADIUS - 0.5);
                    const rotationY = Math.atan2(-x, -z);
                    
                    return (
                        <ArtFrame 
                            key={art.id} 
                            url={art.image_url} 
                            title={art.title} 
                            position={[x, ART_Y, z]} 
                            rotation={[0, rotationY, 0]}
                            onSelect={onSelectArt}
                            quality={quality}
                            description={art.description}
                            isSurpriseActive={isSurpriseActive}
                        />
                    );
                })}

            {/* Centerpiece Text Removed */}
        </>
    );
}

// ... Main Page ...
// Update the Canvas section to be more interactive

// --- Main Page ---
export default function GalleryPage() {
    const [selectedArt, setSelectedArt] = useState<any>(null);
    const [showIntro, setShowIntro] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quality, setQuality] = useState<'low' | 'med' | 'high'>('high');
    const [joystickData, setJoystickData] = useState<{ x: number; y: number } | null>(null);
    const [isPortrait, setIsPortrait] = useState(false);
    const [isPointerLocked, setIsPointerLocked] = useState(false);
    const [isImmersionMode, setIsImmersionMode] = useState(false);
    const [isSurpriseActive, setIsSurpriseActive] = useState(false);

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

    return (
        <KeyboardControls map={keyboardMap}>
            <main 
                className="relative h-screen w-full bg-[#050505] overflow-hidden cursor-crosshair"
                onClick={() => {}} 
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
                        dpr={quality === 'high' ? [1, 2] : (quality === 'med' ? [1, 1.5] : 1)}
                        camera={{ position: [0, 1.6, 5], fov: 65 }}
                        gl={{ 
                            antialias: quality === 'high',
                            powerPreference: "high-performance",
                            stencil: false,
                            depth: true
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
                            <GalleryScene 
                                onSelectArt={setSelectedArt} 
                                artworks={artworks} 
                                quality={quality} 
                                isSurpriseActive={isSurpriseActive}
                                setIsSurpriseActive={setIsSurpriseActive}
                            />
                            <Player joystickData={joystickData} />
                            
                            {/* Performance Boosters */}
                            <AdaptiveDpr pixelated />
                            <AdaptiveEvents />
                        </Suspense>
                        
                        {/* Only instantiate PointerLock on Desktop */}
                        {isStarted && typeof window !== 'undefined' && window.innerWidth >= 768 && (
                            <PointerLockControls 
                                selector="#gallery-container"
                                makeDefault 
                                onLock={() => setIsPointerLocked(true)}
                                onUnlock={() => setIsPointerLocked(false)}
                            />
                        )}
                        
                        {/* Environment moved outside main suspense to prevent blocking */}
                        <Suspense fallback={null}>
                             {quality !== 'low' && !isSurpriseActive && <Environment preset="city" />}
                        </Suspense>

                        <ambientLight intensity={isSurpriseActive ? 0.1 : (quality === 'low' ? 1.5 : 1.2)} />
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
                {isStarted && !isPointerLocked && !selectedArt && !isPortrait && typeof window !== 'undefined' && window.innerWidth >= 768 && (
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
                                {['low', 'med', 'high'].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setQuality(q as any)}
                                        className={`px-4 py-2 rounded-full font-outfit text-[8px] uppercase tracking-[0.2em] transition-all border ${
                                            quality === q 
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
                                        Click Canvas to Enter 3D View
                                    </p>
                                </div>
                            </div>
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

                <AnimatePresence>
                    {showIntro && (
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
