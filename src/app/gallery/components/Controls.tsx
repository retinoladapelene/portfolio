"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

const ROOM_RADIUS = 12;

// --- Sub-Component: Virtual Joystick for Mobile ---
export function VirtualJoystick({ onMove, onEnd }: { onMove: (data: { x: number; y: number }) => void, onEnd: () => void }) {
    return (
        <div className="fixed bottom-12 left-12 z-[100]">
            <div className="relative w-32 h-32 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                <motion.div
                    drag
                    dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    dragElastic={1}
                    onDrag={(_, info) => {
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

// --- Sub-Component: Player Controls ---
export function Player({ joystickData }: { joystickData: { x: number; y: number } | null }) {
    const [, get] = useKeyboardControls();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const forwardVector = useRef(new THREE.Vector3());
    const rightVector = useRef(new THREE.Vector3());
    
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    const lastTouch = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined' || window.innerWidth >= 768) return;

        const handleTouchStart = (e: TouchEvent) => {
            lastTouch.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            if (now - (window as any)._lastTap < DOUBLE_TAP_DELAY) {
                window.dispatchEvent(new CustomEvent('toggle-immersion'));
            }
            (window as any)._lastTap = now;
        };

        const handleTouchMove = (e: TouchEvent) => {
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
        
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            state.camera.quaternion.setFromEuler(euler.current);
        } else {
            euler.current.setFromQuaternion(state.camera.quaternion);
        }

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

        const distFromCenter = Math.sqrt(state.camera.position.x ** 2 + state.camera.position.z ** 2);
        if (distFromCenter > ROOM_RADIUS - 3) {
            const ratio = (ROOM_RADIUS - 3) / distFromCenter;
            state.camera.position.x *= ratio;
            state.camera.position.z *= ratio;
        }

        if (forward || backward || left || right || (joystickData && (Math.abs(joystickData.x) > 0.1 || Math.abs(joystickData.y) > 0.1))) {
            state.camera.position.y = 1.7 + Math.sin(state.clock.elapsedTime * 6) * 0.01;
        } else {
            state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.7, 0.1);
        }
    });

    return null;
}
