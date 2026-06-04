"use client";

import { motion, useSpring, useMotionValue, useInView, MotionValue } from "framer-motion";
import { useRef, useEffect, useState, Suspense, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  PerspectiveCamera, 
  Environment as ThreeEnv,
  ContactShadows,
  Sparkles,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { MousePointer2, ArrowRight } from "lucide-react";

// ─── OPTIMIZED 3D COMPONENTS ───────────────────────────────────────────────

// Shared geometry to save memory
const PETAL_GEOMETRY = new THREE.ExtrudeGeometry(
  (() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.5, 0.5, 1, 1.5, 0, 2.5);
    shape.bezierCurveTo(-1, 1.5, -0.5, 0.5, 0, 0);
    return shape;
  })(),
  { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 }
);

const Petal = memo(({ rotation, index, hoverValue }: { rotation: number, index: number, hoverValue: MotionValue<number> }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const wave = Math.sin(t + index) * 0.05;
    const targetRotation = hoverValue.get() * 1.5;
    
    // Smooth lerping based on delta for 120fps consistency
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation + wave, 0.1 * (delta * 60));
    meshRef.current.scale.setScalar(1 + Math.sin(t * 0.5 + index) * 0.02);
  });

  return (
    <group rotation={[0, rotation, 0]}>
      <mesh ref={meshRef} geometry={PETAL_GEOMETRY} position={[0, 0, 0.15]}>
        <MeshTransmissionMaterial
          backside
          samples={3}
          resolution={128}
          thickness={0.8}
          roughness={0.1}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          color="#f5f3ff"
          attenuationDistance={1}
          attenuationColor="#c084fc"
        />
      </mesh>
    </group>
  );
});

Petal.displayName = "Petal";

function CrystalInkFlower({ mouseX, mouseY }: { mouseX: MotionValue<number>, mouseY: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const stamensRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const hoverValue = useSpring(hovered ? 1 : 0, { stiffness: 60, damping: 20 });
  useEffect(() => { hoverValue.set(hovered ? 1 : 0); }, [hovered, hoverValue]);

  useFrame((state, delta) => {
    if (!groupRef.current || !lightRef.current || !coreRef.current) return;
    const t = state.clock.getElapsedTime();
    const speedFactor = delta * 60;
    
    // Smooth group motion tied to delta
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (mouseX.get() * 0.5) + t * 0.1, 0.05 * speedFactor);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (mouseY.get() * 0.3) + 0.5, 0.05 * speedFactor);
    
    // Counter-rotation and vertical pulsing for stamens
    if (stamensRef.current) {
      stamensRef.current.rotation.y -= 0.015 * speedFactor;
      stamensRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    }

    // Light and core effects
    lightRef.current.position.set(mouseX.get() * 2, -(mouseY.get() * 2), 2);
    lightRef.current.intensity = (hovered ? 3 : 1.5) + Math.sin(t * 2) * 0.5;
    coreRef.current.scale.setScalar(1.2 + (hoverValue.get() * 0.2) + (Math.sin(t * 1.5) * 0.05));
  });

  return (
    <group onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} position={[0, -0.9, 0]}>
      {/* Optimized Particles */}
      <Sparkles count={20} scale={6} size={1.2} speed={0.4} opacity={0.2} color="#D8B4FE" />
      
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
          <mesh ref={coreRef}>
            <sphereGeometry args={[0.3, 32, 32]} /> {/* Increased for smoothness */}
            <meshStandardMaterial color="#A855F7" emissive="#D8B4FE" emissiveIntensity={hovered ? 4 : 2} toneMapped={false} />
          </mesh>

          {/* Glowing Stamens (Benang Sari) */}
          <group ref={stamensRef}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI * 2) / 6;
              return (
                <group key={i} rotation={[0, angle, 0.25]}>
                  {/* Stem/Filament */}
                  <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.004, 0.008, 0.3, 8]} />
                    <meshStandardMaterial 
                      color="#D8B4FE" 
                      transparent 
                      opacity={0.4} 
                      roughness={0.2} 
                    />
                  </mesh>
                  {/* Glowing Anther Tip */}
                  <mesh position={[0, 0.3, 0]}>
                    <sphereGeometry args={[0.035, 12, 12]} />
                    <meshStandardMaterial 
                      color="#EC4899" 
                      emissive="#F472B6" 
                      emissiveIntensity={hovered ? 6 : 3} 
                      toneMapped={false} 
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
          
          <mesh scale={1.3}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.05} wireframe />
          </mesh>

          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Petal key={i} rotation={(i * Math.PI) / 4} index={i} hoverValue={hoverValue} />
          ))}
          <pointLight ref={lightRef} distance={6} intensity={2} color="#D8B4FE" />
        </group>
      </Float>

      <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={10} blur={4} far={4} resolution={64} frames={1} color="#A855F7" />
    </group>
  );
}

// ─── MAIN HERO COMPONENT ───────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const jakartaTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(now);
      setTime(`Jakarta ${jakartaTime.replace(":", ".")}`);
    };

    updateTime();
    setMounted(true);
    const timer = setInterval(updateTime, 60000); 
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInView || isMobile) return;
      mouseX.set((e.clientX / window.innerWidth - 0.5));
      mouseY.set((e.clientY / window.innerHeight - 0.5));
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(timer);
    };
  }, [mouseX, mouseY, isInView, isMobile]);

  const metrics = [
    { label: "Clients", val: "200+" },
    { label: "Years", val: "06" },
    { label: "Assets", val: "500+" },
  ];

  return (
    <section ref={containerRef} className="relative w-full h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden bg-white px-4 md:px-6">
      
      {/* ─── BACKGROUND ARTIFACT ────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[35vw] md:text-[25vw] font-black text-slate-950 uppercase tracking-tighter leading-none"
        >
          STUDIO
        </motion.div>
      </div>

      {/* ─── 3D STAGE (OPTIMIZED FOR 120FPS) ────────────────────────────────── */}
      <div className="absolute inset-0 z-10">
        {(mounted && isInView) && (
          <Canvas 
            dpr={[1, 1.2]} // Capped for insane smoothness
            gl={{ 
              antialias: false, // Disabling for raw speed
              alpha: true, 
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 12 : 9]} fov={35} />
            <ambientLight intensity={0.5} />
            <Suspense fallback={null}>
              <CrystalInkFlower mouseX={mouseX} mouseY={mouseY} />
              <ThreeEnv preset="dawn" />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* ─── UI LAYER ───────────────────────────────────────── */}
      <div className="absolute top-8 md:top-12 left-6 md:left-10 z-50">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-lg md:text-xl font-black text-slate-950 font-outfit uppercase tracking-tighter leading-none">
            Moonchaery
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[7px] font-black text-purple-600 uppercase tracking-[0.2em] block">
              {mounted ? time : "JAKARTA 00.00"}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-8 md:top-12 right-10 z-50 hidden md:block text-right">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Commission Status</p>
          <p className="text-sm font-medium text-slate-950 italic font-serif leading-tight">
            Where character design <br /> meets digital evolution.
          </p>
        </motion.div>
      </div>

      <div className="absolute left-6 md:left-10 top-[35%] md:top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
          <h3 className="text-[12vw] md:text-[5vw] font-black text-slate-950 leading-[0.85] tracking-tighter font-outfit uppercase">
            Digital<br />
            <span className="text-purple-600 italic">Art</span>
          </h3>
        </motion.div>
      </div>

      <div className="absolute bottom-12 right-6 md:right-10 z-50 flex flex-row items-end md:items-center gap-4 md:gap-12">
        {metrics.map((m, i) => (
          <motion.div 
            key={m.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.7 + (i * 0.1) }}
            className="flex flex-col items-start md:items-center"
          >
            <span className="text-xl md:text-3xl font-black text-slate-950 font-outfit leading-none">{m.val}</span>
            <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-12 left-6 md:left-1/2 md:-translate-x-1/2 z-[100] w-[calc(100%-48px)] md:w-fit">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 100 }}
          className="bg-slate-950 p-1.5 md:p-2 rounded-full flex items-center gap-1 shadow-2xl"
        >
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openOrderForm"))}
            className="flex-1 md:flex-none px-6 md:px-12 py-3.5 md:py-4 bg-purple-600 text-white rounded-full font-black text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all hover:bg-white hover:text-slate-950 flex items-center justify-center gap-2 md:gap-3"
          >
            <span>Initiate</span>
            <ArrowRight size={12} className="md:w-[14px]" />
          </button>
          
          <button 
            onClick={() => window.location.href = '/gallery'}
            className="px-5 md:px-10 py-3.5 md:py-4 text-white font-black text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-white/10 rounded-full transition-all"
          >
            Gallery
          </button>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-48 right-10 hidden md:flex flex-col items-center gap-4 opacity-10 pointer-events-none"
      >
        <MousePointer2 size={12} className="text-slate-950" />
      </motion.div>

    </section>
  );
}
