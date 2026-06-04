"use client";

import { Text } from "@react-three/drei";

export function InfoBoard({ isSurpriseActive, setIsSurpriseActive }: { isSurpriseActive: boolean, setIsSurpriseActive: (v: boolean) => void }) {
    return (
        <group position={[0, -0.15, 1.0]} rotation={[-0.6, 0, 0]}>
            <mesh>
                <planeGeometry args={[0.7, 0.35]} />
                <meshStandardMaterial color="#1a0000" />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[0.72, 0.37]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
            </mesh>
            
            <group position={[0, 0.05, 0.02]}>
                <Text fontSize={0.04} color="#D4AF37" anchorX="center" anchorY="middle" outlineWidth={0.002} outlineColor="#000000">
                    {isSurpriseActive ? "HAPPY BIRTHDAY" : "ZarryLinilo X Mamystaa"}
                </Text>
            </group>

            {/* Interactive Button: Surprise Me */}
            <group 
                position={[0, -0.1, 0.02]} 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsSurpriseActive(!isSurpriseActive);
                }}
            >
                {/* Button Frame (Gold) */}
                <mesh position={[0, 0, -0.005]}>
                    <planeGeometry args={[0.32, 0.12]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Button Background (Deep Velvet/Maroon) */}
                <mesh onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'crosshair')}>
                    <planeGeometry args={[0.3, 0.1]} />
                    <meshStandardMaterial 
                        color={isSurpriseActive ? "#D4AF37" : "#2a0000"} 
                        roughness={0.8}
                        metalness={0.1}
                    />
                </mesh>

                <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.022}
                    color={isSurpriseActive ? "#000" : "#D4AF37"}
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.1}
                >
                    {isSurpriseActive ? "RESET GALLERY" : "SURPRISE ME"}
                </Text>

                {/* Subtle Glow under the button */}
                <pointLight position={[0, 0, 0.05]} intensity={0.1} color="#D4AF37" />
            </group>
        </group>
    );
}
