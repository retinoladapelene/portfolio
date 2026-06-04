"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SpotLight, Instances, Instance, useTexture } from "@react-three/drei";
import { ParquetFloor, Chandelier } from "./GalleryAssets";
import { DayNightSky } from "./Environment";
import { ArtFrame } from "./ArtFrame";
import { MusicBox, LoveLetter, NovelBook, MusicBoxAudio } from "./MusicBox";
import { InfoBoard } from "./InfoBoard";
import { Artwork, RenderQuality, GallerySceneProps, PedestalArtProps } from "@/types/gallery";
const ROOM_RADIUS = 12;
const ART_Y = 4.5;

// Shared geometries for performance
const wallGeoLow = new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, 12, 32, 1, true);
const wallGeoHigh = new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, 12, 64, 1, true);
const floorGeo = new THREE.CircleGeometry(ROOM_RADIUS, 64);
const trimGeoLow = new THREE.CylinderGeometry(ROOM_RADIUS - 0.1, ROOM_RADIUS - 0.1, 1.5, 32, 1, true);
const trimGeoHigh = new THREE.CylinderGeometry(ROOM_RADIUS - 0.1, ROOM_RADIUS - 0.1, 1.5, 64, 1, true);
const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 7, 16);
const capGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
const trimBaseGeoLow = new THREE.CylinderGeometry(ROOM_RADIUS - 0.1, ROOM_RADIUS - 0.1, 1.5, 32, 1, true);
const trimBaseGeoHigh = new THREE.CylinderGeometry(ROOM_RADIUS - 0.1, ROOM_RADIUS - 0.1, 1.5, 64, 1, true);
const trimGoldGeoLow = new THREE.CylinderGeometry(ROOM_RADIUS - 0.15, ROOM_RADIUS - 0.15, 0.05, 32, 1, true);
const trimGoldGeoHigh = new THREE.CylinderGeometry(ROOM_RADIUS - 0.15, ROOM_RADIUS - 0.15, 0.05, 64, 1, true);

/**
 * Sub-component representing the central pedestal art and its interactive states.
 * Swaps between the primary artwork and the Surprise (Music Box/Novel) state.
 */
function PedestalArt({ 
    quality, 
    isSurpriseActive, 
    setIsSurpriseActive, 
    setShowLetter, 
    isLetterOpen, 
    setShowBook, 
    isBookOpen
}: PedestalArtProps) {
    const texture = useTexture("/zarrylinilo.png");
    
    return (
        <group position={[0, 1.15, 0]}>
            <MusicBoxAudio active={isSurpriseActive} isBookOpen={isBookOpen} />
            {isSurpriseActive ? (
                <group>
                    <MusicBox />
                    <NovelBook onClick={() => setShowBook(true)} isBookOpen={isBookOpen} />
                    <LoveLetter onClick={() => setShowLetter(true)} isLetterOpen={isLetterOpen} />
                </group>
            ) : (
                <>
                    <mesh position={[0, 0.6, 0]}>
                        <cylinderGeometry args={[0.9, 0.9, 1.2, quality === 'low' ? 12 : 24]} />
                        <meshStandardMaterial 
                            transparent 
                            opacity={0.2} 
                            roughness={0} 
                            metalness={0.5}
                            color="#fff"
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    <mesh position={[0, 0.6, 0]}>
                        <boxGeometry args={[0.55, 0.75, 0.05]} />
                        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.6, 0.03]}>
                        <planeGeometry args={[0.5, 0.7]} />
                        <meshStandardMaterial map={texture} color="#fff" />
                    </mesh>
                </>
            )}

            <InfoBoard isSurpriseActive={isSurpriseActive} setIsSurpriseActive={setIsSurpriseActive} />
        </group>
    );
}

/**
 * Main 3D Gallery Scene Component.
 */
export function GalleryScene({ 
    onSelectArt, 
    artworks, 
    quality, 
    isSurpriseActive, 
    setIsSurpriseActive, 
    setShowLetter, 
    isLetterOpen, 
    setShowBook, 
    isBookOpen
}: GallerySceneProps) {
    const ambientIntensity = isSurpriseActive 
        ? 0 
        : (quality === 'low' ? 1.4 : 1.0);
    const wallColor = "#2d0000";

    return (
        <>
            <ambientLight intensity={ambientIntensity} />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} geometry={floorGeo}>
                <ParquetFloor quality={quality} />
            </mesh>

            <mesh position={[0, 4, 0]} geometry={quality === 'low' ? wallGeoLow : wallGeoHigh}>
                <meshStandardMaterial color={wallColor} side={THREE.BackSide} roughness={0.8} />
            </mesh>

            <mesh position={[0, 0.75, 0]} geometry={quality === 'low' ? trimBaseGeoLow : trimBaseGeoHigh}>
                <meshStandardMaterial color="#1a0000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, 1.5, 0]} geometry={quality === 'low' ? trimGoldGeoLow : trimGoldGeoHigh}>
                <meshStandardMaterial color="#D4AF37" side={THREE.BackSide} metalness={1} roughness={0.2} />
            </mesh>

            <mesh position={[0, 9.25, 0]} geometry={quality === 'low' ? trimBaseGeoLow : trimBaseGeoHigh}>
                <meshStandardMaterial color="#1a0000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, 8.5, 0]} geometry={quality === 'low' ? trimGoldGeoLow : trimGoldGeoHigh}>
                <meshStandardMaterial color="#D4AF37" side={THREE.BackSide} metalness={1} roughness={0.2} />
            </mesh>

            <Instances range={artworks.length} geometry={pillarGeo}>
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

            <group position={[0, 0, 0]}>
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.8, 0.9, 0.3, 32]} />
                    <meshStandardMaterial color="#1a0000" />
                </mesh>
                <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.95, 0.95, 0.05, 32]} />
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.65, 0]}>
                    <cylinderGeometry args={[0.6, 0.7, 0.7, 32]} />
                    <meshStandardMaterial color="#2d0000" />
                </mesh>
                <mesh position={[0, 1.05, 0]}>
                    <cylinderGeometry args={[0.85, 0.8, 0.1, 32]} />
                    <meshStandardMaterial color="#1a0000" />
                </mesh>
                <mesh position={[0, 1.1, 0]}>
                    <cylinderGeometry args={[0.9, 0.9, 0.03, 32]} />
                    <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
                </mesh>
                
                <PedestalArt 
                    quality={quality} 
                    isSurpriseActive={isSurpriseActive} 
                    setIsSurpriseActive={setIsSurpriseActive}
                    setShowLetter={setShowLetter}
                    isLetterOpen={isLetterOpen}
                    setShowBook={setShowBook}
                    isBookOpen={isBookOpen}
                />

                {!isSurpriseActive && <Chandelier quality={quality} isSurpriseActive={isSurpriseActive} />}

                {quality !== 'low' && (
                    <SpotLight 
                        position={[0, 9, 0]}
                        angle={0.3}
                        penumbra={0.2}
                        intensity={isSurpriseActive 
                            ? (quality === 'high' ? 600 : 300) 
                            : (quality === 'high' ? 1500 : 800)}
                        color="#FFD700"
                        target-position={[0, 1.5, 0]}
                        distance={12}
                        attenuation={15}
                        anglePower={12}
                        opacity={quality === 'high' ? 0.3 : 0.1}
                        castShadow={quality === 'high'}
                    />
                )}
            </group>

            <group position={[0, 10, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} visible={!isSurpriseActive}>
                    <circleGeometry args={[ROOM_RADIUS, 64]} />
                    <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
                </mesh>

                {isSurpriseActive && (
                    <DayNightSky quality={quality} />
                )}

                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} visible={!isSurpriseActive}>
                    <torusGeometry args={[ROOM_RADIUS - 2.5, 0.04, 16, 64]} />
                    <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                </mesh>

                {!isSurpriseActive && (
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <circleGeometry args={[ROOM_RADIUS * 0.35, 32]} />
                        <meshBasicMaterial color="#fff" transparent opacity={0.5} />
                    </mesh>
                )}
                <directionalLight position={[0, -1, 0]} intensity={isSurpriseActive ? 0.1 : 1.5} color="#fff" />
            </group>

            {useMemo(() => artworks
                .filter((art: Artwork) => art.image_url && art.image_url !== "undefined")
                .map((art: Artwork, i: number) => {
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
                }), [artworks, quality, isSurpriseActive, onSelectArt])}
        </>
    );
}
