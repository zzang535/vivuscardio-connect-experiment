"use client";

import { useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

interface HelperVisualsProps {
  showHelpers: boolean;
  selectedMesh: THREE.Mesh | null;
}

export default function HelperVisuals({ showHelpers, selectedMesh }: HelperVisualsProps) {
  const { scene } = useThree();
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);

  useEffect(() => {
    // GridHelper
    if (showHelpers && !gridHelperRef.current) {
      gridHelperRef.current = new THREE.GridHelper(20, 20);
      scene.add(gridHelperRef.current);
    } else if (!showHelpers && gridHelperRef.current) {
      scene.remove(gridHelperRef.current);
      gridHelperRef.current = null;
    }

    // AxesHelper
    if (showHelpers && !axesHelperRef.current) {
      axesHelperRef.current = new THREE.AxesHelper(5);
      scene.add(axesHelperRef.current);
    } else if (!showHelpers && axesHelperRef.current) {
      scene.remove(axesHelperRef.current);
      axesHelperRef.current = null;
    }

    return () => {
      if (gridHelperRef.current) scene.remove(gridHelperRef.current);
      if (axesHelperRef.current) scene.remove(axesHelperRef.current);
    };
  }, [showHelpers, scene]);

  // BoxHelper for selected mesh
  useEffect(() => {
    if (boxHelperRef.current) {
      scene.remove(boxHelperRef.current);
      boxHelperRef.current = null;
    }

    if (showHelpers && selectedMesh) {
      boxHelperRef.current = new THREE.BoxHelper(selectedMesh, 0xffff00);
      scene.add(boxHelperRef.current);
    }

    return () => {
      if (boxHelperRef.current) {
        scene.remove(boxHelperRef.current);
        boxHelperRef.current = null;
      }
    };
  }, [showHelpers, selectedMesh, scene]);

  // Update BoxHelper when mesh moves
  useEffect(() => {
    if (boxHelperRef.current && selectedMesh) {
      const animate = () => {
        if (boxHelperRef.current) {
          boxHelperRef.current.update();
        }
      };
      const interval = setInterval(animate, 16);
      return () => clearInterval(interval);
    }
  }, [selectedMesh]);

  return null;
}
