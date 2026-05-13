"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, ContactShadows, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

interface BrushProps {
  onPositionUpdate?: (x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function BrushModel({ onPositionUpdate, containerRef }: BrushProps) {
  const meshRef = useRef<THREE.Group>(null);
  const tipRef = useRef<THREE.Group>(null);

  // Organic Handle Shape using Lathe
  const handlePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 10; i++) points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.05 + 0.08, i * 0.1));
    for (let i = 0; i <= 20; i++) points.push(new THREE.Vector2(0.18 - Math.pow(i - 10, 2) * 0.001, 1 + i * 0.15));
    for (let i = 0; i <= 5; i++) points.push(new THREE.Vector2(0.15 - i * 0.01, 4 + i * 0.1));
    return points;
  }, []);

  const ferrulePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 10; i++) points.push(new THREE.Vector2(0.15 + i * 0.02, i * 0.12));
    return points;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const { x, y } = state.pointer;
    
    // Update model orientation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.4, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.2, 0.05);
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

    // Report Position of the BRUSH TIP (Bristles), not the cursor
    if (tipRef.current && containerRef.current) {
        const tipPos = new THREE.Vector3();
        tipRef.current.getWorldPosition(tipPos);
        
        // Project 3D world position to 2D screen coordinates
        tipPos.project(state.camera);
        
        const rect = containerRef.current.getBoundingClientRect();
        // Convert projected coordinates (-1 to +1) to pixel coordinates
        const canvasX = ((tipPos.x + 1) / 2) * rect.width;
        const canvasY = ((1 - tipPos.y) / 2) * rect.height;
        
        onPositionUpdate?.(canvasX, canvasY);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} scale={0.7}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <group rotation={[0, 0, 0.1]}>
          
          <mesh position={[0, -3, 0]}>
            <latheGeometry args={[handlePoints, 32]} />
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.05} metalness={0.05} clearcoat={1} />
          </mesh>

          <group position={[0, 1.3, 0]}>
            <mesh>
              <latheGeometry args={[ferrulePoints, 32]} />
              <meshPhysicalMaterial color="#E2E8F0" metalness={1} roughness={0.1} clearcoat={1} />
            </mesh>
            {[0.3, 0.6, 0.9].map((y, i) => (
              <mesh key={i} position={[0, y, 0]}>
                <torusGeometry args={[0.2 + y * 0.1, 0.012, 16, 100]} />
                <meshStandardMaterial color="#94A3B8" metalness={1} roughness={0.1} />
              </mesh>
            ))}
          </group>

          {/* BRUSH TIP (Head) - Mask tracking happens here */}
          <group position={[0, 3.2, 0]} ref={tipRef}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.35, 0.3, 0.4, 32]} />
              <meshPhysicalMaterial color="#C084FC" roughness={0.5} />
            </mesh>
            <mesh scale={[1.8, 1.4, 0.4]}>
              <sphereGeometry args={[0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
              <MeshDistortMaterial color="#D8B4FE" speed={1} distort={0.1} radius={1} />
            </mesh>
            <mesh position={[0, 0.4, 0]} scale={[1.7, 1.6, 0.35]}>
              <cylinderGeometry args={[0.22, 0.28, 0.8, 32]} />
              <meshPhysicalMaterial color="#C084FC" roughness={0.4} sheen={1} sheenColor="#D8B4FE" />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}

interface BrushCanvasProps {
    onPositionUpdate?: (x: number, y: number) => void;
    onDraggingStateChange?: (isDragging: boolean) => void;
}

export default function BrushCanvas({ onPositionUpdate, onDraggingStateChange }: BrushCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
    >
      <Canvas 
        shadows 
        dpr={[1, 2]}
        onPointerDown={() => onDraggingStateChange?.(true)}
        onPointerUp={() => onDraggingStateChange?.(false)}
        onPointerLeave={() => onDraggingStateChange?.(false)}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        
        <Suspense fallback={null}>
          <BrushModel onPositionUpdate={onPositionUpdate} containerRef={containerRef} />
          <Environment preset="studio" />
        </Suspense>

        <ambientLight intensity={0.4} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={2} 
          castShadow 
        />
        
        <ContactShadows 
          position={[0, -4, 0]} 
          opacity={0.25} 
          scale={15} 
          blur={3} 
          far={4} 
        />
      </Canvas>
    </div>
  );
}
