import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

const Globe = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  // Create wireframe geometry
  const wireGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(2.2, 36, 24);
    return new THREE.WireframeGeometry(geo);
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = 0.15;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.08;
      wireRef.current.rotation.x = 0.15;
    }
  });

  return (
    <group>
      {/* Solid translucent sphere */}
      <Sphere ref={meshRef} args={[2.2, 64, 48]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.12} />
      </lineSegments>

      {/* Inner glow sphere */}
      <Sphere args={[2.0, 32, 24]}>
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.02}
        />
      </Sphere>
    </group>
  );
};

const GlobeBackground = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <Globe />
      </Canvas>
    </div>
  );
};

export default GlobeBackground;
