"use client";

import dynamic from 'next/dynamic';

// Dynamically import the 3D background component to avoid SSR issues with Three.js
const AnimatedBackground = dynamic(
  () => import('./AnimatedBackground'),
  { ssr: false }
);

interface BackgroundWrapperProps {
  accentColor: string;
}

export default function BackgroundWrapper({ accentColor }: BackgroundWrapperProps) {
  return <AnimatedBackground accentColor={accentColor} />;
}
