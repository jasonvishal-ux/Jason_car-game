
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { Environment, Sky, Stars, PerspectiveCamera, Cloud, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import CarModel from './CarModel';
import { CarStats, Obstacle, Projectile } from '../types';

// Augment the JSX namespace to include Three.js elements for React Three Fiber.
// This resolves the 'Property does not exist on type JSX.IntrinsicElements' errors.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface GameSceneProps {
  selectedCar: CarStats;
  isNitro: boolean;
  onUpdateHUD: (stats: { speed: number; ammo: number; nitro: number; score: number }) => void;
  isFiring: boolean;
}

const Road: React.FC<{ zOffset: number }> = ({ zOffset }) => {
  return (
    <group position={[0, 0, zOffset]}>
      {/* High-quality Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 100, 10, 10]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Grid Overlay for crisp look */}
      <gridHelper args={[14, 20, "#222", "#111"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
      
      {/* Neon Side Markings */}
      <mesh position={[-6.8, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 100]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[6.8, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 100]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </mesh>

      {/* Side Barriers */}
      <mesh position={[-7.2, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1.2, 100]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      <mesh position={[7.2, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1.2, 100]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
    </group>
  );
};

const Obstacles: React.FC<{ obstacles: Obstacle[] }> = ({ obstacles }) => {
  return (
    <>
      {obstacles.map((obs) => (
        <group key={obs.id} position={obs.position}>
            <mesh castShadow receiveShadow>
            {obs.type === 'box' ? (
                <boxGeometry args={[1.2, 1.2, 1.2]} />
            ) : (
                <cylinderGeometry args={[0.6, 0.6, 1.8, 16]} />
            )}
            <meshStandardMaterial 
                color={obs.health > 50 ? "#ff4400" : "#ff0000"} 
                emissive={obs.health > 50 ? "#331100" : "#550000"}
                metalness={0.7}
                roughness={0.2}
            />
            </mesh>
            {/* Health Bar floating above */}
            <mesh position={[0, 1.5, 0]}>
                <planeGeometry args={[obs.health/100, 0.1]} />
                <meshBasicMaterial color="#00ff00" />
            </mesh>
        </group>
      ))}
    </>
  );
};

const GameplayLogic: React.FC<GameSceneProps> = ({ selectedCar, isNitro, onUpdateHUD, isFiring }) => {
  const { camera } = useThree();
  const carPos = useRef(new THREE.Vector3(0, 0, 0));
  const carVel = useRef(0);
  const [lane, setLane] = useState(0); // -2, -1, 0, 1, 2
  const [score, setScore] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [weaponEnergy, setWeaponEnergy] = useState(100);
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastFireTime = useRef(0);

  // Arrow controls for movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setLane(l => Math.max(-2, l - 1));
      if (e.key === 'ArrowRight') setLane(l => Math.min(2, l + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame((state, delta) => {
    // 1. Movement Logic
    const targetSpeed = isNitro && nitro > 0 ? selectedCar.topSpeed * 1.4 : selectedCar.topSpeed;
    carVel.current = THREE.MathUtils.lerp(carVel.current, targetSpeed, delta * selectedCar.acceleration);
    carPos.current.z += (carVel.current / 12) * delta;
    carPos.current.x = THREE.MathUtils.lerp(carPos.current.x, lane * 2.2, delta * 12 * selectedCar.handling);

    // 2. Resource Management
    if (isNitro && nitro > 0) {
      setNitro(n => Math.max(0, n - delta * 25));
    } else if (nitro < 100) {
      setNitro(n => Math.min(100, n + delta * 6));
    }

    // 3. Firing - Gun with Time Limit / Drain
    if (isFiring && weaponEnergy > 0) {
        if (state.clock.elapsedTime - lastFireTime.current > 0.1) {
            setProjectiles(prev => [
                ...prev,
                { id: Math.random(), position: [carPos.current.x - 0.45, 0.65, carPos.current.z + 1], velocity: [0, 0, 80] },
                { id: Math.random() + 1, position: [carPos.current.x + 0.45, 0.65, carPos.current.z + 1], velocity: [0, 0, 80] }
            ]);
            lastFireTime.current = state.clock.elapsedTime;
        }
        setWeaponEnergy(e => Math.max(0, e - delta * 15)); // Drains energy while active
    } else if (!isFiring && weaponEnergy < 100) {
        setWeaponEnergy(e => Math.min(100, e + delta * 8)); // Recharges over time
    }

    // 4. Update Projectiles
    setProjectiles(prev => prev
      .map(p => ({
        ...p,
        position: [p.position[0], p.position[1], p.position[2] + p.velocity[2] * delta] as [number, number, number]
      }))
      .filter(p => p.position[2] < carPos.current.z + 80)
    );

    // 5. Spawn Logic (Enhanced)
    if (obstacles.length < 18) {
      const spawnZ = carPos.current.z + 70 + Math.random() * 50;
      setObstacles(prev => [
        ...prev,
        {
          id: Math.random(),
          position: [(Math.floor(Math.random() * 5) - 2) * 2.2, 0.6, spawnZ],
          health: 100,
          type: Math.random() > 0.4 ? 'box' : 'cylinder'
        }
      ]);
    }

    // 6. Collision: Projectile vs Obstacle
    setProjectiles(projs => {
      const nextProjs = [...projs];
      setObstacles(obss => {
        return obss.map(obs => {
          let h = obs.health;
          for (let i = nextProjs.length - 1; i >= 0; i--) {
            const p = nextProjs[i];
            const dx = p.position[0] - obs.position[0];
            const dz = p.position[2] - obs.position[2];
            if (Math.abs(dx) < 0.8 && Math.abs(dz) < 0.8) {
              h -= 40;
              nextProjs.splice(i, 1);
            }
          }
          return { ...obs, health: h };
        }).filter(obs => {
            if (obs.health <= 0) {
                setScore(s => s + 150);
                return false;
            }
            return obs.position[2] > carPos.current.z - 5;
        });
      });
      return nextProjs;
    });

    // 7. Collision: Car vs Obstacle
    obstacles.forEach(obs => {
        const dx = carPos.current.x - obs.position[0];
        const dz = carPos.current.z - obs.position[2];
        if (Math.abs(dx) < 1.2 && Math.abs(dz) < 1.2) {
            carVel.current *= 0.4; // Sharp slow down
            setScore(s => Math.max(0, s - 25));
        }
    });

    // Camera follow (Smoother)
    const camTarget = new THREE.Vector3(carPos.current.x * 0.5, 3.5, carPos.current.z - 8);
    camera.position.lerp(camTarget, delta * 4);
    camera.lookAt(carPos.current.x, 1, carPos.current.z + 12);

    // Update HUD
    onUpdateHUD({ 
        speed: Math.round(carVel.current), 
        ammo: Math.round(weaponEnergy), 
        nitro: Math.round(nitro), 
        score 
    });
  });

  return (
    <>
      <group position={[carPos.current.x, carPos.current.y, carPos.current.z]}>
        <CarModel color={selectedCar.color} type={selectedCar.id} isNitro={isNitro && nitro > 0} isFiring={isFiring && weaponEnergy > 0} />
        {isNitro && (
            <Sparkles count={50} scale={2} size={2} speed={4} color="#00ffff" />
        )}
      </group>

      {/* Infinite track tiling */}
      <Road zOffset={Math.floor(carPos.current.z / 100) * 100} />
      <Road zOffset={Math.floor(carPos.current.z / 100) * 100 + 100} />
      <Road zOffset={Math.floor(carPos.current.z / 100) * 100 + 200} />

      <Obstacles obstacles={obstacles} />
      
      {/* High-speed bullet visualizer */}
      {projectiles.map(p => (
        <mesh key={p.id} position={p.position}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ffff00" />
            <pointLight distance={3} intensity={0.5} color="#ffff00" />
        </mesh>
      ))}

      {/* Environment Detail */}
      <Cloud position={[20, 15, carPos.current.z + 50]} opacity={0.2} speed={0.2} width={20} depth={5} />
      <Cloud position={[-20, 20, carPos.current.z + 150]} opacity={0.2} speed={0.1} width={30} depth={10} />
    </>
  );
};

const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <div className="w-full h-full bg-[#020205]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, stencil: false }}>
        <PerspectiveCamera makeDefault position={[0, 5, -12]} fov={65} />
        <Sky sunPosition={[10, 5, 10]} turbidity={0.1} rayleigh={0.5} />
        <Stars radius={150} depth={50} count={7000} factor={6} saturation={1} fade speed={2} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
        />
        
        <GameplayLogic {...props} />
        
        <Environment preset="night" />
        <fog attach="fog" args={["#020205", 20, 90]} />
      </Canvas>
    </div>
  );
};

export default GameScene;
