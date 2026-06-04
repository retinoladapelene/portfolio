"use client";

import { useMemo } from "react";
import * as THREE from "three";

const chainGeo = new THREE.TorusGeometry(0.03, 0.008, 6, 12);
const mainBodyGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.5, 12);
const centralRingGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16);
const armGeo = new THREE.TorusGeometry(0.2, 0.022, 6, 24, Math.PI);
const armOuterGeo = new THREE.TorusGeometry(0.15, 0.022, 6, 24, Math.PI);
const candleHolderGeo = new THREE.SphereGeometry(0.045, 6, 6);
const candleGeo = new THREE.CylinderGeometry(0.07, 0.1, 0.18, 12, 1, true);
const candleRingTopGeo = new THREE.TorusGeometry(0.07, 0.008, 6, 16);
const candleRingBotGeo = new THREE.TorusGeometry(0.1, 0.008, 6, 16);
const bottomCapGeo = new THREE.CylinderGeometry(0.12, 0.05, 0.1, 12);
const bottomSphereGeo = new THREE.SphereGeometry(0.05, 8, 8);

// --- Sub-Component: Grand Ornate Chandelier ---
export function Chandelier({ quality, isSurpriseActive }: { quality: string, isSurpriseActive: boolean }) {
    const chainLinks = Array.from({ length: 17 }, (_, i) => i * 0.15);

    return (
        <group position={[0, 7.5, 0]}>
            {chainLinks.map((y) => (
                <mesh key={y} position={[0, y, 0]} rotation={[0, (y / 0.15) % 2 === 0 ? 0 : Math.PI / 2, 0]} geometry={chainGeo}>
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                </mesh>
            ))}

            <mesh position={[0, -0.2, 0]} geometry={mainBodyGeo}>
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.3, 0]} geometry={centralRingGeo}>
                <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
            </mesh>

            {[0, 60, 120, 180, 240, 300].map((angle) => (
                <group key={angle} rotation={[0, (angle * Math.PI) / 180, 0]}>
                    <mesh position={[0.25, -0.35, 0]} rotation={[0, 0, -Math.PI / 6]} geometry={armGeo}>
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                    </mesh>
                    <mesh position={[0.42, -0.22, 0]} rotation={[0, 0, Math.PI / 1.2]} geometry={armOuterGeo}>
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
                    </mesh>
                    
                    <mesh position={[0.08, -0.38, 0]} geometry={candleHolderGeo}>
                        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
                    </mesh>

                    <group position={[0.55, -0.12, 0]}>
                        <mesh geometry={candleGeo}>
                            <meshStandardMaterial 
                                color="#fffaf0" 
                                emissive="#FFD700" 
                                emissiveIntensity={0.2} 
                                transparent 
                                opacity={0.9} 
                                side={THREE.DoubleSide} 
                            />
                        </mesh>
                        <mesh position={[0, 0.09, 0]} geometry={candleRingTopGeo}>
                            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
                        </mesh>
                        <mesh position={[0, -0.09, 0]} geometry={candleRingBotGeo}>
                            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
                        </mesh>
                        
                        <pointLight 
                            intensity={isSurpriseActive ? 0.2 : (quality === 'low' ? 1.4 : 1.0)} 
                            distance={8} 
                            color="#fff0d0" 
                            position={[0, 0, 0]} 
                            castShadow={quality === 'high'}
                        />
                    </group>
                </group>
            ))}

            <mesh position={[0, -0.45, 0]} geometry={bottomCapGeo}>
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.52, 0]} geometry={bottomSphereGeo}>
                <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
            </mesh>
        </group>
    );
}

// --- Sub-Component: Natural Wood Floor ---
export function ParquetFloor({ quality }: { quality: string }) {
    const texture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Warm wood brown base
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(0, 0, 1024, 1024);

        const plankW = 128;
        const plankH = 512;
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.save();
                ctx.translate(i * plankW, j * plankH);
                
                // Varied wood brown tones
                const tint = Math.random() * 20;
                ctx.fillStyle = `rgb(${61 + tint}, ${43 + tint}, ${31 + tint})`;
                ctx.fillRect(2, 2, plankW - 4, plankH - 4);
                
                // Grain lines
                ctx.globalAlpha = 0.15;
                ctx.strokeStyle = '#2d1b0f';
                for (let k = 0; k < 15; k++) {
                    ctx.beginPath();
                    const startX = Math.random() * plankW;
                    ctx.moveTo(startX, 0);
                    ctx.bezierCurveTo(
                        startX + (Math.random() - 0.5) * 30, plankH * 0.3,
                        startX + (Math.random() - 0.5) * 30, plankH * 0.6,
                        startX + (Math.random() - 0.5) * 15, plankH
                    );
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
    }, []);

    if (!texture) return null;

    return (
        <meshStandardMaterial 
            map={texture} 
            roughness={0.35} 
            metalness={0.05}
            color="#fff"
        />
    );
}
