"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Html, PositionalAudio, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const bookGeo = new THREE.BoxGeometry(0.35, 0.05, 0.5);
const boxGeo = new THREE.BoxGeometry(0.7, 0.25, 0.5);
const baseGeo = new THREE.BoxGeometry(0.75, 0.04, 0.55);
const legGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.2, 8);
const lockGeo = new THREE.BoxGeometry(0.06, 0.04, 0.01);
const innerBaseGeo = new THREE.BoxGeometry(0.65, 0.02, 0.45);
const discGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 24);
const discCapGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12);
const mechanismGeo = new THREE.BoxGeometry(0.15, 0.08, 0.3);
const mechanismCylGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 12);
const lidGeo = new THREE.BoxGeometry(0.7, 0.5, 0.04);
const hingeGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8);
const pedalAxleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 12);
const pedalStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
const pedalArmGeo = new THREE.BoxGeometry(0.01, 0.1, 0.02);
const pedalHandleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8);

// --- Sub-Component: Novel Book ---
export function NovelBook({ onClick, isBookOpen }: { onClick?: () => void, isBookOpen?: boolean }) {
    const texture = useTexture("/images/matilda.jpg");
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (hovered && !isBookOpen) document.body.style.cursor = 'pointer';
        return () => { if (typeof document !== 'undefined') document.body.style.cursor = 'crosshair'; };
    }, [hovered, isBookOpen]);
    
    return (
        <group 
            position={[0.55, -0.01, 0.45]} 
            rotation={[0, -0.2, 0]}
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh castShadow geometry={bookGeo}>
                <meshStandardMaterial attach="material-0" color="#0b6e8a" />
                <meshStandardMaterial attach="material-1" color="#0b6e8a" />
                <meshStandardMaterial attach="material-2" map={texture} />
                <meshStandardMaterial attach="material-3" color="#0b6e8a" />
                <meshStandardMaterial attach="material-4" color="#fff9f0" />
                <meshStandardMaterial attach="material-5" color="#fff9f0" />
            </mesh>

            {/* Interactive Indicator */}
            {!isBookOpen && (
                <Html position={[0, 0.25, 0]} center distanceFactor={2.5}>
                    <div className={cn(
                        "bg-[#D4AF37]/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none whitespace-nowrap border border-white/20 shadow-xl flex items-center gap-2 transition-all duration-300",
                        hovered ? "scale-110 opacity-100" : "scale-100 opacity-80"
                    )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        Open Book
                    </div>
                </Html>
            )}
        </group>
    );
}

// --- Sub-Component: Love Letter ---
export function LoveLetter({ onClick, isLetterOpen }: { onClick?: () => void, isLetterOpen?: boolean }) {
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (hovered && !isLetterOpen) document.body.style.cursor = 'pointer';
        return () => { if (typeof document !== 'undefined') document.body.style.cursor = 'crosshair'; };
    }, [hovered, isLetterOpen]);

    return (
        <group 
            position={[-0.55, -0.03, 0.45]} 
            rotation={[0, 0.8, 0]}
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh castShadow>
                <boxGeometry args={[0.3, 0.015, 0.2]} />
                <meshStandardMaterial color={hovered ? "#fffdf5" : "#fff9ed"} roughness={0.4} />
            </mesh>
            
            <group position={[0, 0.008, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.035, 32]} />
                    <meshStandardMaterial color={hovered ? "#a00000" : "#8b0000"} />
                </mesh>
                <Text
                    position={[0, 0.001, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.04}
                    color="#b30000"
                >
                    ❤
                </Text>
            </group>

            <mesh position={[0, 0.008, -0.02]}>
                <boxGeometry args={[0.28, 0.001, 0.08]} />
                <meshStandardMaterial color="#f2e8cf" />
            </mesh>

            {/* Interactive Indicator */}
            {!isLetterOpen && (
                <Html position={[0, 0.15, 0]} center distanceFactor={2.5}>
                    <div className={cn(
                        "bg-[#D4AF37]/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none whitespace-nowrap border border-white/20 shadow-xl flex items-center gap-2 transition-all duration-300",
                        hovered ? "scale-110 opacity-100" : "scale-100 opacity-80"
                    )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        Open Letter
                    </div>
                </Html>
            )}
        </group>
    );
}

// --- Sub-Component: Music Box ---
export function MusicBox() {
    const groupRef = useRef<THREE.Group>(null!);
    const discRef = useRef<THREE.Mesh>(null!);
    const handleRef = useRef<THREE.Group>(null!);
    const { camera } = useThree();
    
    // Add AudioListener to camera for PositionalAudio
    useEffect(() => {
        const listener = new THREE.AudioListener();
        camera.add(listener);
        return () => { camera.remove(listener); };
    }, [camera]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        // Base box is static as requested
        if (discRef.current) discRef.current.rotation.y = -t * 2;
        if (handleRef.current) handleRef.current.rotation.x = t * 4;
    });

    return (
        <group ref={groupRef} position={[0, 0.1, -0.15]}>
            <mesh castShadow geometry={boxGeo}>
                <meshStandardMaterial color="#4d2c19" roughness={0.2} metalness={0.1} />
            </mesh>
            
            <mesh position={[0, -0.12, 0]} geometry={baseGeo}>
                <meshStandardMaterial color="#3d2b1f" roughness={0.3} />
            </mesh>

            {[[-0.32, -0.22], [0.32, -0.22], [-0.32, 0.22], [0.32, 0.22]].map((pos, i) => (
                <mesh key={i} position={[pos[0], -0.05, pos[1]]} geometry={legGeo}>
                    <meshStandardMaterial color="#3d2b1f" roughness={0.2} />
                </mesh>
            ))}

            <mesh position={[0, 0, 0.252]} geometry={lockGeo}>
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} emissive="#D4AF37" emissiveIntensity={0.2} />
            </mesh>

            <group position={[0, 0.13, 0]}>
                <mesh position={[0, -0.02, 0]} geometry={innerBaseGeo}>
                    <meshStandardMaterial color="#2a1a10" roughness={0.5} />
                </mesh>

                <group ref={discRef as any} position={[-0.1, 0.01, 0]}>
                    <mesh castShadow geometry={discGeo}>
                        <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.01, 0]} geometry={discCapGeo}>
                        <meshStandardMaterial color="#D4AF37" metalness={1} />
                    </mesh>
                </group>

                <group position={[0.2, 0.02, 0]}>
                    <mesh castShadow geometry={mechanismGeo}>
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} geometry={mechanismCylGeo}>
                        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.1} />
                    </mesh>
                </group>
            </group>

            <group position={[0, 0.125, -0.25]} rotation={[-Math.PI / 2.1, 0, 0]}>
                <mesh position={[0, 0.25, 0]} castShadow geometry={lidGeo}>
                    <meshStandardMaterial color="#4d2c19" roughness={0.2} />
                    
                    <Text
                        position={[0, 0, 0.021]}
                        fontSize={0.06}
                        color="#D4AF37"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Moonchaery
                    </Text>
                </mesh>
                <mesh position={[-0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={hingeGeo}>
                    <meshStandardMaterial color="#D4AF37" metalness={1} />
                </mesh>
                <mesh position={[0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={hingeGeo}>
                    <meshStandardMaterial color="#D4AF37" metalness={1} />
                </mesh>
            </group>

            <group position={[0.35, -0.05, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]} geometry={pedalAxleGeo}>
                    <meshStandardMaterial color="#D4AF37" metalness={1} />
                </mesh>
                
                <group ref={handleRef as any}>
                    <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={pedalStemGeo}>
                        <meshStandardMaterial color="#222" metalness={1} />
                    </mesh>
                    <mesh position={[0.06, -0.05, 0]} geometry={pedalArmGeo}>
                        <meshStandardMaterial color="#222" metalness={1} />
                    </mesh>
                    <mesh position={[0.08, -0.1, 0]} rotation={[0, 0, Math.PI / 2]} geometry={pedalHandleGeo}>
                        <meshStandardMaterial color="#3d2b1f" roughness={0.2} />
                    </mesh>
                </group>
            </group>

            <pointLight position={[0, 0.3, 0]} intensity={1.5} distance={3} color="#FFD700" />
        </group>
    );
}

// --- Sub-Component: Music Box Audio ---
export function MusicBoxAudio({ active, isBookOpen }: { active: boolean, isBookOpen?: boolean }) {
    if (!active) return null;

    const audioUrl = isBookOpen ? "/matilda-harry.mp3" : "/surprise.mp3";

    return (
        <PositionalAudio
            key={audioUrl} // Re-mount when URL changes to ensure it plays the new track
            url={audioUrl}
            distance={5}
            loop
            autoplay
        />
    );
}
