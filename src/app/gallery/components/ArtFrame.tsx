"use client";

import { useState, useEffect } from "react";
import { useTexture, Text, Detailed } from "@react-three/drei";
import * as THREE from "three";

const frameGeo = new THREE.BoxGeometry(2.4, 3.4, 0.1);
const innerFrameGeo = new THREE.BoxGeometry(2.2, 3.2, 0.05);
const artGeo = new THREE.PlaneGeometry(2, 3);
const ledGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
const ledHeadGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.15, 8);
const ledStemGeo = new THREE.BoxGeometry(0.05, 0.2, 0.05);

// --- Sub-Component: Art Frame (Classic Style) ---
export function ArtFrame({ url, title, position, rotation, onSelect, quality, description, isSurpriseActive }: any) {
    const texture = useTexture(url) as THREE.Texture;
    const [failed, setFailed] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (texture && texture.image) {
            // Apply object-cover logic by adjusting UVs
            const imgAspect = texture.image.width / texture.image.height;
            const frameAspect = 2 / 3;

            if (imgAspect > frameAspect) {
                // Image is wider than frame -> Crop sides
                const repeatX = frameAspect / imgAspect;
                texture.repeat.set(repeatX, 1);
                texture.offset.set((1 - repeatX) / 2, 0);
            } else {
                // Image is taller than frame -> Crop top/bottom
                const repeatY = imgAspect / frameAspect;
                texture.repeat.set(1, repeatY);
                texture.offset.set(0, (1 - repeatY) / 2);
            }

            // Performance adjustment: Higher anisotropy only for high quality
            texture.anisotropy = quality === 'high' ? 16 : 4;
            texture.minFilter = quality === 'low' ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
            texture.generateMipmaps = quality !== 'low';
            texture.needsUpdate = true;
        }
    }, [texture, quality]);

    const frameContent = (
        <group>
            {/* LED Track Light Head (Ceiling Mounted) - Fades out in surprise mode */}
            {!isSurpriseActive && (
                <group position={[0, 6.5, 2]}>
                    <mesh position={[0, 0.2, 0]} geometry={ledStemGeo}>
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    
                    <group rotation={[0.3, 0, 0]}>
                        <mesh geometry={ledGeo}>
                            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, -0.05, 0]} geometry={ledHeadGeo}>
                            <meshBasicMaterial color={hovered ? "#FFD700" : "#333"} />
                        </mesh>
                    </group>
                </group>
            )}

            {quality === 'high' ? (
                <group>
                    <mesh 
                        onPointerOver={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                        onClick={() => onSelect({ url, title, description })}
                        geometry={frameGeo}
                    >
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                    </mesh>

                    <mesh position={[0, 0, 0.05]} geometry={innerFrameGeo}>
                        <meshStandardMaterial color="#8B6508" metalness={1} roughness={0.1} />
                    </mesh>

                    <mesh position={[0, 0, 0.1]} onClick={() => onSelect({ url, title, description })} geometry={artGeo}>
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
                    <group>
                        <mesh 
                            onPointerOver={() => setHovered(true)}
                            onPointerOut={() => setHovered(false)}
                            onClick={() => onSelect({ url, title, description })}
                        >
                            <boxGeometry args={[2.4, 3.4, 0.1]} />
                            <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                        </mesh>

                        <mesh position={[0, 0, 0.05]}>
                            <boxGeometry args={[2.2, 3.2, 0.05]} />
                            <meshStandardMaterial color="#8B6508" metalness={1} roughness={0.1} />
                        </mesh>

                        <mesh position={[0, 0, 0.1]} onClick={() => onSelect({ url, title, description })}>
                            <planeGeometry args={[2, 3]} />
                            <meshStandardMaterial map={texture} color={failed ? "#1a1a1a" : "#fff"} />
                        </mesh>

                        <Text
                            position={[0, -2.2, 0.1]}
                            fontSize={0.15}
                            color="#D4AF37"
                            fillOpacity={hovered ? 1 : 0.6}
                        >
                            {title.toUpperCase()}
                        </Text>
                    </group>

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

                    <mesh onClick={() => onSelect({ url, title, description })}>
                        <planeGeometry args={[2.4, 3.4]} />
                        <meshStandardMaterial color="#1a0000" />
                    </mesh>
                </Detailed>
            )}
        </group>
    );

    return (
        <group position={position} rotation={rotation}>
            {frameContent}
        </group>
    );
}
