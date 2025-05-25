"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";


interface AnimatedBackgroundProps {
  accentColor: string;
}

function AnimatedSphere({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [speed] = useState(() => 0.1 + Math.random() * 0.2);
  const [rotationAxis] = useState(() => [
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01 * rotationAxis[0];
      meshRef.current.rotation.y += speed * 0.01 * rotationAxis[1];
      meshRef.current.rotation.z += speed * 0.01 * rotationAxis[2];
    }
  });

  return (
    <Sphere args={[1, 64, 64]} ref={meshRef}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.4}
        speed={4}
        roughness={0.2}
        metalness={0.8}
        opacity={0.7}
        transparent={true}
      />
    </Sphere>
  );
}

// Create custom motion components for Three.js
const MotionGroup = motion.create("group");

export default function AnimatedBackground({ accentColor }: AnimatedBackgroundProps) {
  // Convert hex to RGB for better control
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 }; // Default to blue if parsing fails
  };

  const rgb = hexToRgb(accentColor);
  const primaryColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const secondaryColor = `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 20)}, ${Math.min(255, rgb.b + 40)})`;

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color={secondaryColor} />
        
        <MotionGroup
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <group position={[0, 0, -5]}>
            <AnimatedSphere color={primaryColor} />
          </group>
        </MotionGroup>

        <MotionGroup
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        >
          <group position={[5, -2, -10]} scale={[2, 2, 2]}>
            <AnimatedSphere color={secondaryColor} />
          </group>
        </MotionGroup>

        <MotionGroup
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          position={[0, -5, -15]}
          scale={3}
        >
          <AnimatedSphere color={primaryColor} />
        </MotionGroup>
      </Canvas>
    </div>
  );
}
