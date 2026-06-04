"use client";

import { useRef, useMemo, forwardRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

/**
 * A unified component that manages the entire celestial cycle.
 * It handles the movement of the sun/moon and the color of the sky/fog.
 */
export function DayNightSky({ quality = 'high' }) {
    const sunRef = useRef<THREE.Group>(null!);
    const moonRef = useRef<THREE.Group>(null!);
    const skyRef = useRef<THREE.Mesh>(null!);
    const starRef = useRef<THREE.Points>(null!);
    const ambientRef = useRef<THREE.AmbientLight>(null!);
    const sunLightRef = useRef<THREE.DirectionalLight>(null!);
    
    // Performance optimization: Reuse color objects to avoid GC pressure in useFrame
    const currentSkyColor = useMemo(() => new THREE.Color(), []);
    
    // Cycle parameters: 40 seconds loop
    const radius = 120;

    // Colors Palette
    const dayColor = new THREE.Color("#87CEEB");     // Sky Blue
    const morningColor = new THREE.Color("#FF8C00"); // Golden Morning
    const sunsetColor = new THREE.Color("#FF4500");  // Deep Sunset
    const twilightColor = new THREE.Color("#483D8B"); // Blue Hour / Dusk
    const nightColor = new THREE.Color("#000005");   // Midnight
    const dawnColor = new THREE.Color("#4B0082");    // Purple Dawn

    useFrame((state) => {
        const t_clock = state.clock.getElapsedTime();
        const progress = (t_clock % 40) / 40;
        const angle = progress * Math.PI * 2;

        // 1. Move Sun
        const sunX = -Math.cos(angle) * radius;
        const sunY = Math.sin(angle) * radius;
        sunRef.current.position.set(sunX, sunY, -50);

        // 2. Move Moon
        const moonX = -Math.cos(angle + Math.PI) * radius;
        const moonY = Math.sin(angle + Math.PI) * radius;
        moonRef.current.position.set(moonX, moonY, -50);

        // 3. Interpolate Sky Color
        const getAlpha = (start: number, end: number) => {
            const t = (progress - start) / (end - start);
            return THREE.MathUtils.smoothstep(t, 0, 1);
        };

        if (progress < 0.1) {
            if (progress < 0.05) currentSkyColor.lerpColors(dawnColor, morningColor, getAlpha(0, 0.05));
            else currentSkyColor.lerpColors(morningColor, dayColor, getAlpha(0.05, 0.1));
        } else if (progress < 0.4) {
            currentSkyColor.copy(dayColor);
        } else if (progress < 0.5) {
            if (progress < 0.46) currentSkyColor.lerpColors(dayColor, morningColor, getAlpha(0.4, 0.46));
            else if (progress < 0.48) currentSkyColor.lerpColors(morningColor, sunsetColor, getAlpha(0.46, 0.48));
            else currentSkyColor.lerpColors(sunsetColor, twilightColor, getAlpha(0.48, 0.5));
        } else if (progress < 0.6) {
            currentSkyColor.lerpColors(twilightColor, nightColor, getAlpha(0.5, 0.6));
        } else if (progress < 0.9) {
            currentSkyColor.copy(nightColor);
        } else {
            currentSkyColor.lerpColors(nightColor, dawnColor, getAlpha(0.9, 1.0));
        }

        // Apply color
        if (skyRef.current) (skyRef.current.material as THREE.MeshBasicMaterial).color.copy(currentSkyColor);
        state.scene.fog?.color.copy(currentSkyColor);

        // 4. Dynamic Lighting Intensity based on Sun Height
        // Sun height is sunY / radius (range -1 to 1)
        const sunFactor = Math.max(0, sunY / radius);
        if (ambientRef.current) ambientRef.current.intensity = 0.1 + sunFactor * 0.4;
        if (sunLightRef.current) sunLightRef.current.intensity = sunFactor * 1.5;

        // 5. Star visibility
        if (starRef.current) {
            const starOpacity = progress > 0.5 && progress < 0.9 ? 0.8 : 0;
            const mat = (starRef.current.material as THREE.PointsMaterial);
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, starOpacity, 0.05);
        }
    });

    return (
        <group>
            <ambientLight ref={ambientRef} intensity={0.4} />
            <directionalLight ref={sunLightRef} position={[0, 50, 0]} intensity={1.5} color="#fff" />
            
            <mesh ref={skyRef}>
                <sphereGeometry args={[150, 32, 32]} />
                <meshBasicMaterial side={THREE.BackSide} />
            </mesh>

            <Starfield ref={starRef} count={quality === 'high' ? 4000 : 1500} />

            <group ref={sunRef}>
                <Sun />
            </group>

            <group ref={moonRef}>
                <CrescentMoon />
            </group>

            <NightClouds />
            <ShootingStar />
        </group>
    );
}

const Starfield = forwardRef(({ count = 5000, radius = 100 }: { count?: number, radius?: number }, ref: any) => {
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
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[points, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="#ffffff" transparent opacity={0} sizeAttenuation={true} />
        </points>
    );
});

function Sun() {
    const glowTexture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        
        // Sun Glow Effect
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');       // Core white
        grad.addColorStop(0.2, 'rgba(255, 250, 213, 0.8)');   // Inner glow
        grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');     // Outer halo
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');      // Fade out
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <Billboard follow={true}>
            <group scale={12}>
                {/* Core light - Very intense */}
                <mesh>
                    <planeGeometry args={[2, 2]} />
                    {glowTexture && (
                        <meshBasicMaterial 
                            map={glowTexture} 
                            transparent={true} 
                            blending={THREE.AdditiveBlending} 
                            depthWrite={false}
                        />
                    )}
                </mesh>
                
                {/* Secondary larger halo for extra atmospheric bloom */}
                <mesh scale={3.5}>
                    <planeGeometry args={[2, 2]} />
                    {glowTexture && (
                        <meshBasicMaterial 
                            map={glowTexture} 
                            transparent={true} 
                            opacity={0.25}
                            blending={THREE.AdditiveBlending} 
                            depthWrite={false}
                        />
                    )}
                </mesh>

                <pointLight intensity={20} distance={200} color="#FFFAD5" />
            </group>
        </Billboard>
    );
}

function CrescentMoon() {
    const moonShape = useMemo(() => {
        const shape = new THREE.Shape();
        const radius = 5;
        const d = 2.2; 
        const innerRadius = Math.sqrt(d * d + radius * radius);
        const startAngle = Math.PI - Math.asin(radius / innerRadius);
        const endAngle = Math.PI + Math.asin(radius / innerRadius);
        shape.absarc(0, 0, radius, -Math.PI / 2, Math.PI / 2, false);
        shape.absarc(d, 0, innerRadius, startAngle, endAngle, true);
        return shape;
    }, []);

    return (
        <Billboard follow={true}>
            <group rotation={[0, 0, 0.6]} scale={1.8}>
                <mesh>
                    <shapeGeometry args={[moonShape]} />
                    <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1.2} side={THREE.DoubleSide} />
                </mesh>
                <pointLight intensity={5} distance={50} color="#fffbe6" />
            </group>
        </Billboard>
    );
}

export function ShootingStar() {
    const groupRef = useRef<THREE.Group>(null!);
    const active = useRef(false);
    const progress = useRef(0);
    const startPos = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const lastTrigger = useRef(0);

    useFrame((state) => {
        const t_clock = state.clock.getElapsedTime();
        const cycleProgress = (t_clock % 40) / 40;
        const isDay = cycleProgress >= 0 && cycleProgress < 0.5;

        // Hide if day
        if (isDay) {
            if (groupRef.current) groupRef.current.visible = false;
            active.current = false;
            return;
        }

        if (t_clock - lastTrigger.current > 12) {
            lastTrigger.current = t_clock;
            progress.current = 0;
            active.current = true;
            if (groupRef.current) groupRef.current.visible = true;

            const camera = state.camera;
            const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
            const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
            const forward = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).negate();
            
            startPos.current.copy(camera.position)
                .add(forward.clone().multiplyScalar(80))
                .add(up.clone().multiplyScalar(20))
                .add(right.clone().multiplyScalar(-30 + Math.random() * 20));
            direction.current.copy(right).multiplyScalar(60).add(up.clone().multiplyScalar(-10));
        }

        if (active.current && groupRef.current) {
            progress.current += 0.04;
            if (progress.current > 1) {
                active.current = false;
                groupRef.current.visible = false;
            } else {
                groupRef.current.position.copy(startPos.current.clone().add(direction.current.clone().multiplyScalar(progress.current)));
            }
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            <pointLight intensity={2} distance={10} color="#fff" />
        </group>
    );
}

export function NightClouds() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const count = 12;
    
    const generatedTexture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, 512, 512);
        for (let i = 0; i < 40; i++) {
            const x = 256 + (Math.random() - 0.5) * 300;
            const y = 256 + (Math.random() - 0.5) * 200;
            const radius = 20 + Math.random() * 80;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const cloudData = useMemo(() => Array.from({ length: count }).map(() => ({
        pos: new THREE.Vector3(Math.random() * 400 - 200, 40 + Math.random() * 40, Math.random() * 400 - 200),
        speed: 0.01 + Math.random() * 0.02,
        scale: 40 + Math.random() * 40,
        opacity: 0.1 + Math.random() * 0.2
    })), [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        const cycleProgress = (t % 40) / 40;
        const isDay = cycleProgress >= 0 && cycleProgress < 0.5;

        for (let i = 0; i < count; i++) {
            const data = cloudData[i];
            data.pos.x += data.speed;
            if (data.pos.x > 200) data.pos.x = -200;

            dummy.position.copy(data.pos);
            dummy.scale.set(data.scale, data.scale / 2, 1);
            
            // Look at camera (Billboard behavior)
            dummy.quaternion.copy(state.camera.quaternion);
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        
        // Material opacity adjustment
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;
        const targetOpacity = isDay ? 0.05 : 0.15;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05);
        mat.color.set(isDay ? "#ffffff" : "#777799");
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                map={generatedTexture} 
                transparent 
                opacity={0.1} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}
