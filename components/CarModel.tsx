
import React, { useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

// Augment the JSX namespace to include Three.js elements for React Three Fiber.
// This resolves the 'Property does not exist on type JSX.IntrinsicElements' errors.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface CarModelProps {
  color: string;
  type: string;
  isNitro?: boolean;
  isFiring?: boolean;
}

const CarModel: React.FC<CarModelProps> = ({ color, type, isNitro, isFiring }) => {
  const group = useRef<THREE.Group>(null);
  const leftMuzzle = useRef<THREE.Mesh>(null);
  const rightMuzzle = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      // Subtle tilt and vibration while driving
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * (isNitro ? 0.02 : 0.005);
      group.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.01;
    }
    
    // Muzzle flash effect
    if (isFiring) {
      const flash = Math.sin(state.clock.elapsedTime * 50) > 0;
      if (leftMuzzle.current) leftMuzzle.current.visible = flash;
      if (rightMuzzle.current) rightMuzzle.current.visible = flash;
    } else {
      if (leftMuzzle.current) leftMuzzle.current.visible = false;
      if (rightMuzzle.current) rightMuzzle.current.visible = false;
    }
  });

  return (
    <group ref={group}>
      {/* Chassis - Main Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.3, 0.45, 3.2]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </mesh>

      {/* Aerodynamic Cockpit */}
      <mesh position={[0, 0.75, -0.3]} castShadow>
        <boxGeometry args={[1.0, 0.4, 1.4]} />
        <meshStandardMaterial color="#050505" metalness={1} roughness={0} transparent opacity={0.9} />
      </mesh>

      {/* Wheels with detail */}
      {[[-0.65, 0.25, 1.1], [0.65, 0.25, 1.1], [-0.65, 0.25, -1.1], [0.65, 0.25, -1.1]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.3, 24]} />
            <meshStandardMaterial color="#080808" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[pos[0] > 0 ? 0.05 : -0.05, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.32, 16]} />
            <meshStandardMaterial color="#444" metalness={1} />
          </mesh>
        </group>
      ))}

      {/* Modern Headlights */}
      <mesh position={[-0.45, 0.45, 1.55]}>
        <boxGeometry args={[0.25, 0.1, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.45, 0.45, 1.55]}>
        <boxGeometry args={[0.25, 0.1, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Underglow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 3.5]} />
        <meshBasicMaterial color={isNitro ? "#00ffff" : color} transparent opacity={0.2} />
      </mesh>

      {/* Active Wing / Spoiler */}
      <mesh position={[0, 0.95, -1.4]} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.8} />
      </mesh>
      <mesh position={[-0.6, 0.7, -1.4]}> <boxGeometry args={[0.05, 0.5, 0.2]} /> <meshStandardMaterial color="#111" /> </mesh>
      <mesh position={[0.6, 0.7, -1.4]}> <boxGeometry args={[0.05, 0.5, 0.2]} /> <meshStandardMaterial color="#111" /> </mesh>

      {/* Twin Exhausts / Nitro Burners */}
      <group position={[0, 0.3, -1.6]}>
        <mesh position={[-0.3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={1} />
        </mesh>
        <mesh position={[0.3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={1} />
        </mesh>
        {isNitro && (
          <>
            <mesh position={[-0.3, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 1.2, 16]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0.3, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 1.2, 16]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} />
            </mesh>
          </>
        )}
      </group>

      {/* Deployable Dual Guns */}
      <group position={[0, 0.65, 0.8]}>
        <mesh position={[-0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0.2} />
        </mesh>
        <mesh ref={leftMuzzle} position={[-0.45, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.01, 0.4, 8]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </mesh>
        
        <mesh position={[0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0.2} />
        </mesh>
        <mesh ref={rightMuzzle} position={[0.45, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.01, 0.4, 8]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
};

export default CarModel;
